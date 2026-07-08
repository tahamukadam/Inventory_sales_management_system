// routes/sales.js - transactional sales + invoice
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  requireLogin,
  requireRole,
  getSessionUser,
} = require("../middleware/auth");

function getUserId(req) {
  return req && req.session && req.session.userId ? req.session.userId : null;
}

// POST /api/sales
// Only admin and clerk roles may create sales
router.post("/", requireRole(["admin", "clerk"]), async (req, res) => {
  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : null;
  if (!items || !items.length)
    return res
      .status(400)
      .json({ error: "invalid_input", message: "items array required" });

  const normalized = [];
  for (const it of items) {
    const pid = Number(it.product_id || it.id);
    const qty = Number(it.quantity);
    if (
      !Number.isInteger(pid) ||
      pid <= 0 ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      return res.status(400).json({
        error: "invalid_item",
        message: "product_id and positive integer quantity required",
        item: it,
      });
    }
    normalized.push({ product_id: pid, quantity: qty });
  }

  let conn;
  try {
    conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const productMap = new Map();
      for (const it of normalized) {
        const [rows] = await conn.query(
          "SELECT product_id, name, quantity AS available, price FROM products WHERE product_id = ? FOR UPDATE",
          [it.product_id]
        );
        if (!rows || rows.length === 0) {
          await conn.rollback();
          conn.release();
          return res
            .status(400)
            .json({ error: "product_not_found", product_id: it.product_id });
        }
        productMap.set(it.product_id, rows[0]);
      }

      const insufficient = [];
      for (const it of normalized) {
        const p = productMap.get(it.product_id);
        if (it.quantity > Number(p.available || 0))
          insufficient.push({
            product_id: it.product_id,
            requested: it.quantity,
            available: p.available,
          });
      }
      if (insufficient.length) {
        await conn.rollback();
        conn.release();
        return res
          .status(400)
          .json({ error: "insufficient_stock", items: insufficient });
      }

      let totalAmount = 0;
      for (const it of normalized) {
        const p = productMap.get(it.product_id);
        const unitPrice = Number(p.price || 0);
        totalAmount += unitPrice * it.quantity;
        await conn.query(
          "UPDATE products SET quantity = quantity - ? WHERE product_id = ?",
          [it.quantity, it.product_id]
        );
      }

      const userId = getUserId(req);
      const [saleRes] = await conn.query(
        "INSERT INTO sales (user_id, sale_date, total_amount, status) VALUES (?, NOW(), ?, ?)",
        [userId, totalAmount, "completed"]
      );
      const saleId = saleRes.insertId;

      const insertedItems = [];
      for (const it of normalized) {
        const p = productMap.get(it.product_id);
        const unitPrice = Number(p.price || 0);
        const lineTotal = unitPrice * it.quantity;
        const [si] = await conn.query(
          "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)",
          [saleId, it.product_id, it.quantity, unitPrice, lineTotal]
        );
        await conn.query(
          "INSERT INTO stock_movements (product_id, change_qty, movement_type, reference_id, note, created_by) VALUES (?, ?, ?, ?, ?, ?)",
          [it.product_id, -Math.abs(it.quantity), "sale", saleId, null, userId]
        );
        insertedItems.push({
          sale_item_id: si.insertId,
          sale_id: saleId,
          product_id: it.product_id,
          product_name: p.name,
          quantity: it.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
      }

      await conn.commit();
      conn.release();

      const saleObj = {
        sale_id: saleId,
        user_id: userId,
        sale_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        total_amount: Number(totalAmount.toFixed(2)),
        status: "completed",
      };
      return res.status(201).json({
        sale: saleObj,
        items: insertedItems,
        invoice_url: `/api/sales/${saleId}/invoice`,
      });
    } catch (err) {
      try {
        await conn.rollback();
      } catch (e) {
        /* ignore */
      }
      conn.release();
      console.error("Transaction error in /api/sales:", err);
      return res.status(500).json({
        error: "server_error",
        message: String(err && err.message ? err.message : err),
      });
    }
  } catch (err) {
    console.error("DB connection error in /api/sales:", err);
    return res.status(500).json({
      error: "server_error",
      message: String(err && err.message ? err.message : err),
    });
  }
});

// GET sale + items
router.get("/:id", requireLogin, async (req, res) => {
  const saleId = Number(req.params.id);
  if (!saleId) return res.status(400).json({ error: "invalid_sale_id" });

  try {
    const [sales] = await db.query(
      "SELECT sale_id, user_id, sale_date, total_amount, status FROM sales WHERE sale_id = ?",
      [saleId]
    );
    if (!sales || !sales.length)
      return res.status(404).json({ error: "not_found" });
    const sale = sales[0];
    const [items] = await db.query(
      "SELECT si.*, p.name AS product_name FROM sale_items si LEFT JOIN products p ON p.product_id = si.product_id WHERE si.sale_id = ?",
      [saleId]
    );
    return res.json({ sale, items });
  } catch (err) {
    console.error("GET /api/sales/:id error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// GET invoice HTML
router.get("/:id/invoice", requireLogin, async (req, res) => {
  const saleId = Number(req.params.id);
  if (!saleId) return res.status(400).send("Invalid sale id");

  try {
    const [sales] = await db.query(
      "SELECT s.sale_id, s.user_id, s.sale_date, s.total_amount, s.status, u.username FROM sales s LEFT JOIN users u ON u.user_id = s.user_id WHERE s.sale_id = ?",
      [saleId]
    );
    if (!sales || !sales.length) return res.status(404).send("Sale not found");
    const sale = sales[0];
    const [items] = await db.query(
      "SELECT si.*, p.name AS product_name FROM sale_items si LEFT JOIN products p ON p.product_id = si.product_id WHERE si.sale_id = ?",
      [saleId]
    );

    const companyName = process.env.COMPANY_NAME || "Inventory & Sales";
    const invoiceHtml = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${sale.sale_id}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; margin:20px;}
          h1{font-size:18px}
          table{width:100%; border-collapse:collapse}
          th,td{padding:8px; border:1px solid #ddd; text-align:left}
          .right{text-align:right}
          .muted{color:#666; font-size:0.9rem}
        </style>
      </head>
      <body>
        <h1>${companyName} — Invoice</h1>
        <div class="muted">Invoice #: ${sale.sale_id} • Date: ${
      sale.sale_date
    } • Cashier: ${sale.username || "N/A"}</div>
        <hr/>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th class="right">Line total</th></tr></thead>
          <tbody>
            ${items
              .map(
                (it) => `<tr>
              <td>${escapeHtml(
                it.product_name || "product #" + it.product_id
              )}</td>
              <td>${it.quantity}</td>
              <td>$${Number(it.unit_price).toFixed(2)}</td>
              <td class="right">$${Number(it.line_total).toFixed(2)}</td>
            </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="3" class="right"><strong>Total</strong></td><td class="right"><strong>$${Number(
              sale.total_amount
            ).toFixed(2)}</strong></td></tr>
          </tfoot>
        </table>
        <div style="margin-top:20px;">
          <button onclick="window.print()">Print</button>
          <a href="/" style="margin-left:12px">Close</a>
        </div>
      </body>
      </html>
    `;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(invoiceHtml);
  } catch (err) {
    console.error("GET invoice error", err);
    return res.status(500).send("Server error");
  }
});

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

module.exports = router;

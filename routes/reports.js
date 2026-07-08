// routes/reports.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ----- QUIET MODE -----
// Set to `true` to suppress reports informational logs (SQL / fetched rows).
// Change to `false` if you want to see the SQL and row counts again.
const QUIET = true;
// ----------------------

/**
 * GET /api/reports/sales
 * Query params:
 *   - start : YYYY-MM-DD (optional)
 *   - end   : YYYY-MM-DD (optional)
 *   - format: 'csv' or 'json' (optional, default json)
 *
 * JSON response: [{ sale: {...}, items: [ {...}, ... ] }, ...]
 * CSV: flattened rows (one row per sale_item) with headers.
 *
 * Behavior change: if neither start nor end are provided, the route will return ALL sales (no date WHERE).
 * Also logs SQL and row counts for easier debugging.
 */
router.get("/sales", async (req, res) => {
  try {
    const { start, end, format } = req.query;

    // If no date range at all -> fetch all sales (no WHERE)
    let rows;
    if (!start && !end) {
      const sqlAll = `
        SELECT
          s.sale_id,
          s.sale_date,
          s.total_amount,
          s.status,
          s.user_id,
          u.username AS cashier,
          si.sale_item_id,
          si.product_id,
          p.name AS product_name,
          si.quantity,
          si.unit_price,
          si.line_total
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.sale_id
        LEFT JOIN users u ON u.user_id = s.user_id
        LEFT JOIN products p ON p.product_id = si.product_id
        ORDER BY s.sale_date ASC, s.sale_id ASC
      `;
      if (!QUIET) {
        console.log("[reports] SQL (all):", sqlAll.replace(/\s+/g, " ").trim());
      }
      const result = await db.query(sqlAll);
      rows = result && result[0] ? result[0] : [];
      if (!QUIET) {
        console.log(`[reports] fetched rows (all): ${rows.length}`);
      }
    } else {
      // Use DATE(...) comparison so date-only filters work predictably
      const startDate = start ? String(start) : "1970-01-01";
      const endDate = end ? String(end) : "9999-12-31";

      const sql = `
        SELECT
          s.sale_id,
          s.sale_date,
          s.total_amount,
          s.status,
          s.user_id,
          u.username AS cashier,
          si.sale_item_id,
          si.product_id,
          p.name AS product_name,
          si.quantity,
          si.unit_price,
          si.line_total
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.sale_id
        LEFT JOIN users u ON u.user_id = s.user_id
        LEFT JOIN products p ON p.product_id = si.product_id
        WHERE DATE(s.sale_date) BETWEEN ? AND ?
        ORDER BY s.sale_date ASC, s.sale_id ASC
      `;
      const params = [startDate, endDate];
      if (!QUIET) {
        console.log(
          "[reports] SQL (range):",
          sql.replace(/\s+/g, " ").trim(),
          params
        );
      }
      const result = await db.query(sql, params);
      rows = result && result[0] ? result[0] : [];
      if (!QUIET) {
        console.log(
          `[reports] fetched rows (range ${startDate} -> ${endDate}): ${rows.length}`
        );
      }
    }

    // CSV path
    if (String(format || "").toLowerCase() === "csv") {
      const headers = [
        "sale_id",
        "sale_date",
        "total_amount",
        "status",
        "user_id",
        "cashier",
        "sale_item_id",
        "product_id",
        "product_name",
        "quantity",
        "unit_price",
        "line_total",
      ];
      const esc = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        const q = s.replace(/"/g, '""');
        if (/[",\n\r]/.test(q)) return `"${q}"`;
        return q;
      };

      const lines = [headers.join(",")];
      for (const r of rows) {
        const line = [
          esc(r.sale_id),
          esc(r.sale_date),
          esc(r.total_amount),
          esc(r.status),
          esc(r.user_id),
          esc(r.cashier),
          esc(r.sale_item_id),
          esc(r.product_id),
          esc(r.product_name),
          esc(r.quantity),
          esc(r.unit_price),
          esc(r.line_total),
        ].join(",");
        lines.push(line);
      }
      const csv = lines.join("\r\n");
      const filename = `sales_report.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      return res.send(csv);
    }

    // Group rows by sale_id into [{ sale:{...}, items:[...]}]
    const map = new Map();
    for (const r of rows) {
      const sid = r.sale_id;
      if (!map.has(sid)) {
        map.set(sid, {
          sale: {
            sale_id: sid,
            sale_date: r.sale_date,
            total_amount: Number(r.total_amount),
            status: r.status,
            user_id: r.user_id,
            cashier: r.cashier,
          },
          items: [],
        });
      }
      const entry = map.get(sid);
      entry.items.push({
        sale_item_id: r.sale_item_id,
        product_id: r.product_id,
        product_name: r.product_name,
        quantity: r.quantity,
        unit_price: Number(r.unit_price),
        line_total: Number(r.line_total),
      });
    }

    const result = Array.from(map.values());
    return res.json(result);
  } catch (err) {
    console.error(
      "GET /api/reports/sales error",
      err && err.stack ? err.stack : err
    );
    return res.status(500).json({
      error: "server_error",
      message: String(err && err.message ? err.message : err),
    });
  }
});

module.exports = router;

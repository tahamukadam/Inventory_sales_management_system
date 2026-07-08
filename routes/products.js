// routes/products.js
// Full-featured products routes: search, ids, create, update, delete
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireLogin, requireRole } = require("../middleware/auth");

// GET /api/products?q=...&show_out_of_stock=1
// Require authentication to see product list (privacy)
router.get("/", requireLogin, async (req, res) => {
  const q = (req.query.q || "").trim();
  const showOut = String(req.query.show_out_of_stock || "").trim() === "1";

  const params = [];
  const where = [];
  if (q) {
    // search anywhere in name or sku
    where.push("(name LIKE ? OR sku LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (!showOut) where.push("quantity > 0");
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

  const sql = `SELECT product_id, sku, name, category_id, quantity, reorder_level, price, active, created_at, updated_at
               FROM products ${whereSql} ORDER BY name ASC LIMIT 200`;
  try {
    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/products error", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to load products" });
  }
});

// GET /api/products/ids?ids=1,2,3
router.get("/ids", requireLogin, async (req, res) => {
  const idsParam = req.query.ids || "";
  const ids = idsParam
    .split(",")
    .map((x) => parseInt(x, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!ids.length) return res.json([]);
  const placeholders = ids.map((_) => "?").join(",");
  try {
    const [rows] = await db.query(
      `SELECT product_id, sku, name, quantity, reorder_level, price FROM products WHERE product_id IN (${placeholders})`,
      ids
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/products/ids error", err);
    return res.status(500).json({
      error: "server_error",
      message: "Failed to fetch products by ids",
    });
  }
});

// POST /api/products - create (inventory/admin only)
router.post("/", requireRole(["admin", "inventory"]), async (req, res) => {
  const body = req.body || {};
  const sku = body.sku ? String(body.sku).trim() : null;
  const name = body.name ? String(body.name).trim() : "";
  const quantity = Number.isFinite(Number(body.quantity))
    ? Math.max(0, Math.floor(Number(body.quantity)))
    : 0;
  const reorder_level = Number.isFinite(Number(body.reorder_level))
    ? Math.max(0, Math.floor(Number(body.reorder_level)))
    : 0;
  const price =
    typeof body.price !== "undefined"
      ? Number(Number(body.price).toFixed(2))
      : 0.0;
  const active = body.active ? 1 : 0;
  const category_id =
    body.category_id && Number.isFinite(Number(body.category_id))
      ? Number(body.category_id)
      : null;

  if (!name) {
    return res
      .status(400)
      .json({ error: "validation", message: "Name is required" });
  }

  try {
    const sql = `INSERT INTO products (sku, name, category_id, quantity, reorder_level, price, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      sku,
      name,
      category_id,
      quantity,
      reorder_level,
      price,
      active,
    ];
    const [result] = await db.query(sql, params);
    // fetch created row
    const insertedId = result.insertId;
    const [rows] = await db.query(
      "SELECT * FROM products WHERE product_id = ? LIMIT 1",
      [insertedId]
    );
    return res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error("POST /api/products error", err);
    // handle duplicate SKU nicely
    if (err && err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "duplicate", message: "SKU already exists" });
    }
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to create product" });
  }
});

// PUT /api/products/:id - update (inventory/admin only)
router.put("/:id", requireRole(["admin", "inventory"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "validation", message: "Invalid product id" });
  }

  const body = req.body || {};
  const sku =
    body.sku !== undefined
      ? body.sku
        ? String(body.sku).trim()
        : null
      : undefined;
  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  const quantity =
    body.quantity !== undefined
      ? Math.max(0, Math.floor(Number(body.quantity) || 0))
      : undefined;
  const reorder_level =
    body.reorder_level !== undefined
      ? Math.max(0, Math.floor(Number(body.reorder_level) || 0))
      : undefined;
  const price =
    body.price !== undefined
      ? Number(Number(body.price).toFixed(2))
      : undefined;
  const active = body.active !== undefined ? (body.active ? 1 : 0) : undefined;
  const category_id =
    body.category_id !== undefined
      ? body.category_id
        ? Number(body.category_id)
        : null
      : undefined;

  if (name !== undefined && !name) {
    return res
      .status(400)
      .json({ error: "validation", message: "Name is required" });
  }

  // Build dynamic update
  const fields = [];
  const params = [];
  if (sku !== undefined) {
    fields.push("sku = ?");
    params.push(sku);
  }
  if (name !== undefined) {
    fields.push("name = ?");
    params.push(name);
  }
  if (category_id !== undefined) {
    fields.push("category_id = ?");
    params.push(category_id);
  }
  if (quantity !== undefined) {
    fields.push("quantity = ?");
    params.push(quantity);
  }
  if (reorder_level !== undefined) {
    fields.push("reorder_level = ?");
    params.push(reorder_level);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    params.push(price);
  }
  if (active !== undefined) {
    fields.push("active = ?");
    params.push(active);
  }

  if (!fields.length) {
    return res
      .status(400)
      .json({ error: "validation", message: "No fields to update" });
  }

  try {
    const sql = `UPDATE products SET ${fields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?`;
    params.push(id);
    const [result] = await db.query(sql, params);
    // ensure row exists
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Product not found" });
    }
    const [rows] = await db.query(
      "SELECT * FROM products WHERE product_id = ? LIMIT 1",
      [id]
    );
    return res.json({ product: rows[0] });
  } catch (err) {
    console.error("PUT /api/products/:id error", err);
    if (err && err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "duplicate", message: "SKU already exists" });
    }
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to update product" });
  }
});

// DELETE /api/products/:id - delete (inventory/admin only)
router.delete("/:id", requireRole(["admin", "inventory"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "validation", message: "Invalid product id" });
  }

  try {
    const [result] = await db.query(
      "DELETE FROM products WHERE product_id = ? LIMIT 1",
      [id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Product not found" });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/:id error", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to delete product" });
  }
});

module.exports = router;

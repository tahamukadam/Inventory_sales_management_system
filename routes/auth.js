// routes/auth.js - simple session auth (bcrypt)
const express = require("express");
const router = express.Router();
// updated require to new config path
const db = require("../config/db");
const bcrypt = require("bcrypt");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "missing_credentials" });

  try {
    const [rows] = await db.query(
      "SELECT user_id, username, password_hash, role, full_name FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (!rows || rows.length === 0)
      return res.status(401).json({ error: "invalid_credentials" });
    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.role = user.role;

    return res.json({
      userId: user.user_id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "not_authenticated" });
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, role, full_name FROM users WHERE user_id = ? LIMIT 1",
      [req.session.userId]
    );
    if (!rows || rows.length === 0)
      return res.status(401).json({ error: "not_authenticated" });
    const u = rows[0];
    return res.json({
      userId: u.user_id,
      username: u.username,
      role: u.role,
      full_name: u.full_name,
    });
  } catch (err) {
    console.error("/api/auth/me error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

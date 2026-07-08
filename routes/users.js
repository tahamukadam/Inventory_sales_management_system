// routes/users.js
// Admin-managed users API
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const {
  requireLogin,
  requireRole,
  getSessionUser,
} = require("../middleware/auth");

// Helper to pick public user fields
function publicUserRow(u) {
  return {
    user_id: u.user_id,
    username: u.username,
    role: u.role,
    full_name: u.full_name,
    email: u.email,
    created_at: u.created_at,
  };
}

/**
 * GET /api/users
 * - Admin only: list all users
 */
router.get("/", requireRole(["admin"]), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, role, full_name, email, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json(rows.map(publicUserRow));
  } catch (err) {
    console.error("GET /api/users error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

/**
 * POST /api/users
 * - Admin only: create a user
 * Body: { username, password, role, full_name, email }
 */
router.post("/", requireRole(["admin"]), async (req, res) => {
  try {
    const body = req.body || {};
    const username = body.username ? String(body.username).trim() : "";
    const password = body.password ? String(body.password) : "";
    const role = body.role ? String(body.role) : "clerk";
    const full_name = body.full_name ? String(body.full_name).trim() : null;
    const email = body.email ? String(body.email).trim() : null;

    if (!username) {
      return res
        .status(400)
        .json({ error: "validation", message: "username is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ error: "validation", message: "password is required" });
    }
    // Validate role is one of allowed roles (matches schema)
    if (!["admin", "inventory", "clerk"].includes(role)) {
      return res
        .status(400)
        .json({ error: "validation", message: "invalid role" });
    }

    // check duplicate username
    const [exists] = await db.query(
      "SELECT user_id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (exists && exists.length) {
      return res
        .status(400)
        .json({ error: "duplicate", message: "username already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, password_hash, role, full_name, email) VALUES (?, ?, ?, ?, ?)",
      [username, hash, role, full_name, email]
    );

    const [rows] = await db.query(
      "SELECT user_id, username, role, full_name, email, created_at FROM users WHERE user_id = ? LIMIT 1",
      [result.insertId]
    );
    return res.status(201).json(publicUserRow(rows[0]));
  } catch (err) {
    console.error("POST /api/users error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

/**
 * PUT /api/users/:id
 * - Admin only: update user metadata and role (not password here)
 * Body may contain: { role, full_name, email, username }
 */
router.put("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const uid = Number(req.params.id);
    if (!Number.isInteger(uid) || uid <= 0) {
      return res.status(400).json({ error: "invalid_user_id" });
    }

    const body = req.body || {};
    const fields = [];
    const params = [];

    if (body.username !== undefined) {
      const username = String(body.username).trim();
      if (!username) {
        return res
          .status(400)
          .json({ error: "validation", message: "username required" });
      }
      // check duplicate other user
      const [dup] = await db.query(
        "SELECT user_id FROM users WHERE username = ? AND user_id != ? LIMIT 1",
        [username, uid]
      );
      if (dup && dup.length) {
        return res
          .status(400)
          .json({ error: "duplicate", message: "username already used" });
      }
      fields.push("username = ?");
      params.push(username);
    }

    if (body.role !== undefined) {
      const role = String(body.role);
      if (!["admin", "inventory", "clerk"].includes(role)) {
        return res
          .status(400)
          .json({ error: "validation", message: "invalid role" });
      }
      fields.push("role = ?");
      params.push(role);
    }

    if (body.full_name !== undefined) {
      fields.push("full_name = ?");
      params.push(body.full_name ? String(body.full_name).trim() : null);
    }

    if (body.email !== undefined) {
      fields.push("email = ?");
      params.push(body.email ? String(body.email).trim() : null);
    }

    if (!fields.length) {
      return res
        .status(400)
        .json({ error: "validation", message: "No fields to update" });
    }

    const sql = `UPDATE users SET ${fields.join(
      ", "
    )}, created_at = created_at WHERE user_id = ?`;
    params.push(uid);
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    const [rows] = await db.query(
      "SELECT user_id, username, role, full_name, email, created_at FROM users WHERE user_id = ? LIMIT 1",
      [uid]
    );
    return res.json(publicUserRow(rows[0]));
  } catch (err) {
    console.error("PUT /api/users/:id error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

/**
 * PATCH /api/users/:id/password
 * - If admin: can set any user's password.
 * - If non-admin: user can change their own password: must provide old_password and new_password.
 * Body:
 *  - { password }  // admin resetting
 *  OR
 *  - { old_password, new_password } // user self-change
 */
router.patch("/:id/password", requireLogin, async (req, res) => {
  try {
    const uid = Number(req.params.id);
    if (!Number.isInteger(uid) || uid <= 0) {
      return res.status(400).json({ error: "invalid_user_id" });
    }

    const requester = req.user; // set by requireLogin
    const body = req.body || {};

    // If requester is admin -> allow direct set
    if (requester.role === "admin") {
      if (!body.password) {
        return res
          .status(400)
          .json({ error: "validation", message: "password required" });
      }
      const newHash = await bcrypt.hash(String(body.password), 10);
      const [r] = await db.query(
        "UPDATE users SET password_hash = ? WHERE user_id = ?",
        [newHash, uid]
      );
      if (r.affectedRows === 0) {
        return res.status(404).json({ error: "not_found" });
      }
      return res.json({ ok: true });
    }

    // Non-admin: user must change own password and provide old_password & new_password
    if (requester.userId !== uid) {
      return res.status(403).json({ error: "forbidden" });
    }
    const oldPassword = body.old_password ? String(body.old_password) : "";
    const newPassword = body.new_password ? String(body.new_password) : "";
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "validation",
        message: "old_password and new_password required",
      });
    }
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ? LIMIT 1",
      [uid]
    );
    if (!rows || !rows.length) {
      return res.status(404).json({ error: "not_found" });
    }
    const ok = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      newHash,
      uid,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/users/:id/password error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

/**
 * DELETE /api/users/:id
 * - Admin only. Prevent deleting the last admin or deleting self is optional.
 */
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const uid = Number(req.params.id);
    if (!Number.isInteger(uid) || uid <= 0) {
      return res.status(400).json({ error: "invalid_user_id" });
    }

    const requester = getSessionUser(req);
    if (requester && requester.userId === uid) {
      return res
        .status(400)
        .json({ error: "validation", message: "Cannot delete yourself" });
    }

    // (Optional) Prevent deleting the last admin - check count of admins
    const [admins] = await db.query(
      "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'"
    );
    if (admins && admins[0] && admins[0].cnt <= 1) {
      // if target is an admin, disallow deletion to avoid losing admin access
      const [target] = await db.query(
        "SELECT role FROM users WHERE user_id = ? LIMIT 1",
        [uid]
      );
      if (target && target.length && target[0].role === "admin") {
        return res
          .status(400)
          .json({
            error: "validation",
            message: "Cannot remove the last admin",
          });
      }
    }

    const [r] = await db.query("DELETE FROM users WHERE user_id = ? LIMIT 1", [
      uid,
    ]);
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/users/:id error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

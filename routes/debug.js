// routes/debug.js  -- TEMPORARY debugging endpoint (remove when done)
const express = require("express");
const router = express.Router();

// Returns headers and session object as the server sees them for debugging
router.get("/session", (req, res) => {
  try {
    const safeSession = {};
    if (req.session) {
      // copy non-sensitive keys if exist
      safeSession.userId = req.session.userId || null;
      safeSession.username = req.session.username || null;
      safeSession.role = req.session.role || null;
      // do NOT return password or other secrets
    }
    res.json({
      ok: true,
      serverTime: new Date().toISOString(),
      requestCookieHeader: req.headers.cookie || null,
      session: req.session ? safeSession : null,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

module.exports = router;

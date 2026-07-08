// middleware/auth.js
// Centralized session / role helpers for the app

/**
 * Expected session fields:
 *  - req.session.userId
 *  - req.session.username
 *  - req.session.role
 */

function getSessionUser(req) {
  if (!req || !req.session || !req.session.userId) return null;
  return {
    userId: req.session.userId,
    username: req.session.username || null,
    role: req.session.role || null,
  };
}

// Middleware: require user to be logged in.
// If authenticated, attaches req.user = { userId, username, role }
function requireLogin(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = user;
  next();
}

// Middleware factory: require one of allowedRoles.
// If allowedRoles is empty or not provided, it only requires login.
function requireRole(allowedRoles = []) {
  return function (req, res, next) {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.user = user;
    // If no allowed roles provided, just require login
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return next();
    }
    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Insufficient role" });
    }
    return next();
  };
}

module.exports = {
  getSessionUser,
  requireLogin,
  requireRole,
};

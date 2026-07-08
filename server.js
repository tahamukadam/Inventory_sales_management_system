// server.js - main express app (with reports route)
require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");

// DB module (config folder) -- ensure this file exists at ./config/db.js
const db = require("./config/db");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const reportsRoutes = require("./routes/reports");
// ADDED: users routes (admin-managed users API)
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-please-change",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, // 4 hours
  })
);

app.use(express.static(path.join(__dirname, "public")));

// API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);
// ADDED: mount users API
app.use("/api/users", usersRoutes);

app.get("/ping", (req, res) => res.json({ ok: true }));

// global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  res.status(500).json({
    error: "server_error",
    message: String(err && err.message ? err.message : err),
  });
});

// Attempt DB ping then start server and print both required messages
(async () => {
  let dbOk = false;
  try {
    // Try a lightweight query to validate the pool/credentials
    await db.query("SELECT 1");
    dbOk = true;
    // Print DB connected message
    console.log("1) Database connected ✅");
  } catch (err) {
    // Print DB failure but continue to start server so you can still access static pages / debug
    console.error("1) Database connection failed ❌");
    console.error(err && err.message ? err.message : err);
  }

  // Start the HTTP server and print the running message
  const server = app.listen(PORT, () => {
    console.log(`2) Server running on http://localhost:${PORT} ✅`);
    // If you want to also indicate DB status here (optional), you could:
    if (!dbOk) {
      console.log("   (Warning: DB not connected — some API routes will fail)");
    }
  });

  // Optional: handle server errors (EADDRINUSE etc.)
  server.on("error", (err) => {
    console.error("Server error:", err && err.stack ? err.stack : err);
  });
})();

// scripts/createAdmin.js
require("dotenv").config();
const pool = require("../config/db"); // mysql2/promise pool
const bcrypt = require("bcrypt");

async function run() {
  try {
    const username =
      process.env.CREATE_ADMIN_USERNAME || process.argv[2] || "admin";
    const password =
      process.env.CREATE_ADMIN_PASSWORD || process.argv[3] || "admin123";
    const full_name = process.env.CREATE_ADMIN_FULLNAME || "Administrator";
    const role = "admin";

    if (!username || !password) {
      console.error("Usage: node scripts/createAdmin.js [username] [password]");
      process.exit(1);
    }

    // quick connectivity check
    await pool.query("SELECT 1");

    // check exists
    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing && existing.length) {
      console.log("User already exists with id:", existing[0].user_id);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const [res] = await pool.query(
      "INSERT INTO users (username, password_hash, role, full_name) VALUES (?,?,?,?)",
      [username, hash, role, full_name]
    );
    console.log(
      "Created admin user id",
      res.insertId,
      "username:",
      username,
      "password:",
      password
    );
    process.exit(0);
  } catch (err) {
    console.error(
      "Error creating admin:",
      err && err.message ? err.message : err
    );
    process.exit(1);
  }
}

run();

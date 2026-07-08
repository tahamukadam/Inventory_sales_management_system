# Inventory & Sales Management System (College Project)

Simple full-stack inventory & sales system using:

- Frontend: static HTML/CSS/vanilla JS (Bootstrap)
- Backend: Node.js + Express.js
- Database: MySQL (mysql2)
- Session: express-session (in-memory for dev)
- Port: `3000` (default)

> This README explains how to set up, run, seed, and demo the project.

---

## Requirements

- Node.js (v16+ recommended; you have v22)
- npm
- MySQL server (5.7+ / 8.0+)
- (Optional) Git

---

## Files of interest

- `server.js` — main Express server
- `config/db.js` — MySQL connection pool
- `routes/` — API routes (`auth`, `products`, `sales`, `reports`, etc.)
- `scripts/createAdmin.js` — convenience script to create an `admin` user
- `migrations/schema.sql` — DB schema (create DB + tables)
- `public/` — static frontend pages:
  - `index.html`, `products.html`, `pos.html`, `login.html`, `admin_sales.html`
- `README.md`, `demo_commands.sh`, `demo_commands.ps1` — (this README + demo scripts)

---

## Environment variables

Create a `.env` in project root with the following (example):

PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=inventory_sales
SESSION_SECRET=change_this_for_prod

> Note: On Windows, you can use environment variables or a `.env` file (project uses `dotenv`).

---

## Setup & DB init

1. Install dependencies

```bash
npm install
Create the database & tables. From a shell with MySQL client access:

# Run from project root (adjust username/password)
mysql -u root -p < migrations/schema.sql
# Enter MySQL root password when prompted


If you prefer to run the SQL manually:

Open mysql -u root -p

Create DB and run the contents of migrations/schema.sql.

Create admin user (script uses DB pool; uses bcrypt):

node scripts/createAdmin.js
# Output: Created admin user id X username: admin password: admin123

Run server (development)
node server.js


You should see:

✅ Connected to MySQL database (pool OK)!
✅ Server running on http://localhost:3000

Pages (UI)

POS: http://localhost:3000/pos.html

Products list: http://localhost:3000/products.html

Login: http://localhost:3000/login.html

Admin Sales: http://localhost:3000/admin_sales.html

Admin credentials (created via script):

Username: admin

Password: admin123 (change before submission if required by your instructor)

Quick manual test / demo checklist

Open /login.html and login as admin.

Open /products.html — verify product list loads.

Open /pos.html — search, add items, confirm sale — printable invoice should open.

Open /admin_sales.html — set date range, click Filter, and test Export CSV and Export Itemized CSV.

API tests (copy-paste curl)

The examples save cookies in cookie.txt for session reuse.

Login and save cookie:

curl -s -c cookie.txt -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/auth/login \
  -d '{"username":"admin","password":"admin123"}' | jq


Add a product (authenticated):

curl -s -b cookie.txt -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/products \
  -d '{"sku":"SKUTEST1","name":"Demo Item","quantity":10,"price":3.50}' | jq


List products (public):

curl -s http://localhost:3000/api/products | jq


Create a sale (no auth required if POS logged in — here we use cookie):

curl -s -b cookie.txt -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/sales \
  -d '{"items":[{"product_id":1,"quantity":1}] }' | jq


Get sale details:

curl -s -b cookie.txt http://localhost:3000/api/sales/1 | jq


Download summary CSV (admin):

# opens in browser or saves via curl
curl -s -b cookie.txt "http://localhost:3000/api/reports/sales.csv?from=2025-01-01&to=2025-12-31" -o sales.csv


Download itemized CSV:

curl -s -b cookie.txt "http://localhost:3000/api/reports/sales_itemized.csv?from=2025-01-01&to=2025-12-31" -o sales_itemized.csv
```

-- Create DB
CREATE DATABASE inventory_sales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_sales;

-- Users table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','inventory','clerk') NOT NULL DEFAULT 'clerk',
  full_name VARCHAR(200),
  email VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categories
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
) ENGINE=InnoDB;

-- Products
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(64) UNIQUE,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Stock movements (audit trail)
CREATE TABLE stock_movements (
  movement_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  change_qty INT NOT NULL,
  movement_type VARCHAR(50) NOT NULL, -- sale, adjust, purchase, return
  reference_id INT DEFAULT NULL,
  note TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sales
CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('completed','pending','canceled') DEFAULT 'completed',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sale items
CREATE TABLE sale_items (
  sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Low stock alerts (simple)
CREATE TABLE low_stock_alerts (
  alert_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  found_qty INT NOT NULL,
  sent TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

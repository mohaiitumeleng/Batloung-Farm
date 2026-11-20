-- BATLOUNG FARM - fresh database install only.
-- IMPORTANT: If you already have batloung_farm with your recorded data,
-- DO NOT run this script; it is for a new MySQL installation.
CREATE DATABASE IF NOT EXISTS batloung_farm;
USE batloung_farm;
CREATE TABLE IF NOT EXISTS suppliers (
 supplier_id INT AUTO_INCREMENT PRIMARY KEY,
 business_name VARCHAR(100) NOT NULL,
 contact_person VARCHAR(100) NOT NULL,
 phone VARCHAR(20) NOT NULL UNIQUE,
 province VARCHAR(50) NOT NULL,
 address VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS fruits (
 fruit_id INT AUTO_INCREMENT PRIMARY KEY,
 fruit_name VARCHAR(100) NOT NULL UNIQUE,
 description TEXT,
 status ENUM('AVAILABLE','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
 price_small DECIMAL(10,2) NOT NULL,
 price_medium DECIMAL(10,2) NOT NULL,
 price_large DECIMAL(10,2) NOT NULL,
 CONSTRAINT chk_fruit_prices CHECK(price_small>=0 AND price_medium>=0 AND price_large>=0),
 CONSTRAINT chk_different_prices CHECK(price_small<>price_medium AND price_small<>price_large AND price_medium<>price_large)
);
CREATE TABLE IF NOT EXISTS vendors (
 vendor_id INT AUTO_INCREMENT PRIMARY KEY,
 vendor_name VARCHAR(100) NOT NULL,
 phone_number VARCHAR(20) NOT NULL UNIQUE,
 location VARCHAR(150) NOT NULL,
 registration_date DATE NOT NULL DEFAULT (CURRENT_DATE)
);
CREATE TABLE IF NOT EXISTS purchases (
 purchase_id INT AUTO_INCREMENT PRIMARY KEY,
 supplier_id INT NOT NULL,
 purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
 CONSTRAINT chk_purchase_total CHECK(total_amount>=0),
 CONSTRAINT fk_purchase_supplier FOREIGN KEY(supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS purchase_details (
 purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
 purchase_id INT NOT NULL,
 fruit_id INT NOT NULL,
 quantity INT NOT NULL,
 unit_cost DECIMAL(10,2) NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 CONSTRAINT chk_purchase_quantity CHECK(quantity>0),
 CONSTRAINT chk_purchase_unit_cost CHECK(unit_cost>=0),
 CONSTRAINT fk_detail_purchase FOREIGN KEY(purchase_id) REFERENCES purchases(purchase_id) ON DELETE RESTRICT,
 CONSTRAINT fk_detail_fruit FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS sales (
 sale_id INT AUTO_INCREMENT PRIMARY KEY,
 vendor_id INT NOT NULL,
 sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 payment_method ENUM('CASH','MOBILE_MONEY','CREDIT') NOT NULL DEFAULT 'CASH',
 payment_status ENUM('PAID','PARTIALLY_PAID','UNPAID') NOT NULL DEFAULT 'UNPAID',
 total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
 amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
 outstanding_balance DECIMAL(12,2) GENERATED ALWAYS AS (total_amount-amount_paid) STORED,
 CONSTRAINT chk_sales_payment CHECK(total_amount>=0 AND amount_paid>=0 AND amount_paid<=total_amount),
 CONSTRAINT fk_sale_vendor FOREIGN KEY(vendor_id) REFERENCES vendors(vendor_id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS sales_details (
 sales_detail_id INT AUTO_INCREMENT PRIMARY KEY,
 sale_id INT NOT NULL,
 fruit_id INT NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 quantity INT NOT NULL,
 unit_price DECIMAL(10,2) NOT NULL,
 CONSTRAINT chk_sales_quantity CHECK(quantity>0),
 CONSTRAINT chk_sales_unit_price CHECK(unit_price>=0),
 CONSTRAINT fk_detail_sale FOREIGN KEY(sale_id) REFERENCES sales(sale_id) ON DELETE RESTRICT,
 CONSTRAINT fk_sales_fruit FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS stock (
 stock_id INT AUTO_INCREMENT PRIMARY KEY,
 fruit_id INT NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 available_quantity INT NOT NULL DEFAULT 0,
 CONSTRAINT chk_stock_quantity CHECK(available_quantity>=0),
 CONSTRAINT uq_fruit_packaging UNIQUE(fruit_id,packaging_size),
 CONSTRAINT fk_stock_fruit FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id) ON DELETE RESTRICT
);

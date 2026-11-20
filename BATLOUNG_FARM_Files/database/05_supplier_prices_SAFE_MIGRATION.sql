-- SAFE additive migration. Back up database first. Run ONCE in MySQL Workbench.
-- Keeps all 8 required assignment tables, records and relationships unchanged.
USE batloung_farm;
CREATE TABLE IF NOT EXISTS supplier_prices (
  supplier_price_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  fruit_id INT NOT NULL,
  packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_supplier_fruit_size (supplier_id,fruit_id,packaging_size),
  CONSTRAINT chk_supplier_price_nonnegative CHECK (unit_cost>=0),
  CONSTRAINT fk_supplier_price_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  CONSTRAINT fk_supplier_price_fruit FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id) ON DELETE CASCADE
);
-- Verify existing data stays unchanged:
SELECT COUNT(*) AS original_suppliers FROM suppliers;
SELECT COUNT(*) AS original_fruits FROM fruits;
SELECT COUNT(*) AS saved_supplier_prices FROM supplier_prices;

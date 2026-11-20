-- RUN ONLY ON AN EMPTY, NEW batloung_farm DATABASE.
-- Fictional/test business names and telephone values in this seed. Not an
-- export of the user's existing supplier/vendor records.
USE batloung_farm;
INSERT INTO fruits (fruit_name,description,status,price_small,price_medium,price_large) VALUES
('Red Apples','Fresh sweet and crunchy red apples','AVAILABLE',50,100,150),
('Green Apples','Fresh crisp and slightly sour green apples','AVAILABLE',55,110,165),
('Yellow Apples','Fresh sweet and juicy yellow apples','AVAILABLE',60,120,180),
('Bananas','Fresh ripe yellow bananas','AVAILABLE',40,80,120),
('Oranges','Fresh sweet and juicy oranges','AVAILABLE',45,90,135),
('Mangoes','Fresh sweet and ripe mangoes','AVAILABLE',65,130,195),
('Green Grapes','Fresh sweet green grapes','AVAILABLE',70,140,210),
('Purple Grapes','Fresh juicy purple grapes','AVAILABLE',75,150,225);
INSERT INTO suppliers (business_name,contact_person,phone,province,address) VALUES
('Sample Gauteng Produce','Sales Desk','DEMO-SA-001','Gauteng','Johannesburg, South Africa'),
('Sample Free State Fruit','Sales Desk','DEMO-SA-002','Free State','Bloemfontein, South Africa'),
('Sample KZN Produce','Sales Desk','DEMO-SA-003','KwaZulu-Natal','Durban, South Africa'),
('Sample Cape Orchard','Sales Desk','DEMO-SA-004','Western Cape','Cape Town, South Africa'),
('Sample Eastern Cape Fruit','Sales Desk','DEMO-SA-005','Eastern Cape','Gqeberha, South Africa'),
('Sample Limpopo Produce','Sales Desk','DEMO-SA-006','Limpopo','Tzaneen, South Africa'),
('Sample Mpumalanga Fruit','Sales Desk','DEMO-SA-007','Mpumalanga','Mbombela, South Africa'),
('Sample North West Market','Sales Desk','DEMO-SA-008','North West','Rustenburg, South Africa');
INSERT INTO vendors (vendor_name,phone_number,location,registration_date) VALUES
('Sample Maseru Fresh','DEMO-LS-001','Maseru, Lesotho','2026-09-01'),
('Sample Roma Fruit Shop','DEMO-LS-002','Roma, Lesotho','2026-09-05'),
('Sample Thetsane Stall','DEMO-LS-003','Thetsane, Lesotho','2026-09-10'),
('Sample Maputsoe Market','DEMO-LS-004','Maputsoe, Lesotho','2026-09-15'),
('Sample Mafeteng Corner','DEMO-LS-005','Mafeteng, Lesotho','2026-09-20'),
('Sample Hlotse Market','DEMO-LS-006','Hlotse, Lesotho','2026-09-25'),
('Sample Lithabaneng Shop','DEMO-LS-007','Lithabaneng, Lesotho','2026-10-01'),
('Sample Teyateyaneng Fruit','DEMO-LS-008','Teyateyaneng, Lesotho','2026-10-05');
INSERT INTO stock (fruit_id,packaging_size,available_quantity)
SELECT f.fruit_id, sizes.packaging_size, 0 FROM fruits f
CROSS JOIN (SELECT 'SMALL' AS packaging_size UNION ALL SELECT 'MEDIUM' UNION ALL SELECT 'LARGE') sizes;

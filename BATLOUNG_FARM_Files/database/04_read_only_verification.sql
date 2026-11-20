USE batloung_farm;
SHOW TABLES;
SELECT 'suppliers' table_name,COUNT(*) records FROM suppliers UNION ALL
SELECT 'fruits',COUNT(*) FROM fruits UNION ALL
SELECT 'vendors',COUNT(*) FROM vendors UNION ALL
SELECT 'purchases',COUNT(*) FROM purchases UNION ALL
SELECT 'purchase_details',COUNT(*) FROM purchase_details UNION ALL
SELECT 'sales',COUNT(*) FROM sales UNION ALL
SELECT 'sales_details',COUNT(*) FROM sales_details UNION ALL
SELECT 'stock',COUNT(*) FROM stock;
SELECT f.fruit_name,COUNT(DISTINCT s.packaging_size) AS sizes
FROM fruits f LEFT JOIN stock s ON f.fruit_id=s.fruit_id
GROUP BY f.fruit_id,f.fruit_name HAVING sizes<>3;

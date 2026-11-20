USE batloung_farm;
-- 1. Five most frequently sold fruits
SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold,
       SUM(sd.quantity*sd.unit_price) AS revenue
FROM sales_details sd JOIN fruits f ON f.fruit_id=sd.fruit_id
GROUP BY f.fruit_id,f.fruit_name ORDER BY boxes_sold DESC LIMIT 5;
-- 2. Revenue for date range, inclusive
SET @start_date='2026-11-01'; SET @end_date='2026-11-30';
SELECT COUNT(*) total_sales, COALESCE(SUM(total_amount),0) total_revenue,
 COALESCE(SUM(amount_paid),0) total_collected,
 COALESCE(SUM(outstanding_balance),0) total_outstanding
FROM sales WHERE sale_date>=@start_date AND sale_date<DATE_ADD(@end_date,INTERVAL 1 DAY);
-- 3. Vendor purchasing most boxes
SELECT v.vendor_name,SUM(sd.quantity) AS boxes,
 SUM(sd.quantity*sd.unit_price) AS sale_value
FROM vendors v JOIN sales s ON v.vendor_id=s.vendor_id
JOIN sales_details sd ON sd.sale_id=s.sale_id
GROUP BY v.vendor_id,v.vendor_name ORDER BY boxes DESC LIMIT 1;
-- 4. Stock by fruit and package size
SELECT f.fruit_name,s.packaging_size,s.available_quantity
FROM stock s JOIN fruits f ON f.fruit_id=s.fruit_id
ORDER BY f.fruit_id,FIELD(s.packaging_size,'SMALL','MEDIUM','LARGE');

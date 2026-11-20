const {pool}=require('../config/db');
async function topFruits(){const [r]=await pool.query('SELECT f.fruit_id,f.fruit_name,SUM(d.quantity) AS total_boxes_sold,SUM(d.quantity*d.unit_price) AS total_revenue FROM sales_details d JOIN fruits f ON d.fruit_id=f.fruit_id GROUP BY f.fruit_id,f.fruit_name ORDER BY total_boxes_sold DESC LIMIT 5');return r;}
async function revenue(start,end){const [r]=await pool.query('SELECT COUNT(*) AS total_sales,COALESCE(SUM(total_amount),0) AS total_revenue,COALESCE(SUM(amount_paid),0) AS total_collected,COALESCE(SUM(outstanding_balance),0) AS total_outstanding FROM sales WHERE sale_date>=? AND sale_date<DATE_ADD(?,INTERVAL 1 DAY)',[start,end]);return {start_date:start,end_date:end,...r[0]};}
async function topVendor(){const [r]=await pool.query('SELECT v.vendor_id,v.vendor_name,SUM(d.quantity) AS total_boxes_purchased,SUM(d.quantity*d.unit_price) AS total_purchase_value FROM vendors v JOIN sales s ON s.vendor_id=v.vendor_id JOIN sales_details d ON d.sale_id=s.sale_id GROUP BY v.vendor_id,v.vendor_name ORDER BY total_boxes_purchased DESC LIMIT 1');return r[0]||null;}
async function stock(){
  const [rows]=await pool.query(`
    SELECT
      f.fruit_id,
      f.fruit_name,
      f.status,
      COALESCE(MAX(CASE WHEN s.packaging_size = 'SMALL' THEN s.available_quantity END), 0) AS small_boxes,
      COALESCE(MAX(CASE WHEN s.packaging_size = 'MEDIUM' THEN s.available_quantity END), 0) AS medium_boxes,
      COALESCE(MAX(CASE WHEN s.packaging_size = 'LARGE' THEN s.available_quantity END), 0) AS large_boxes
    FROM fruits f
    LEFT JOIN stock s ON s.fruit_id = f.fruit_id
    GROUP BY f.fruit_id, f.fruit_name, f.status
    ORDER BY f.fruit_id
  `);
  return rows;
}
async function balances(){const [r]=await pool.query('SELECT v.vendor_id,v.vendor_name,COALESCE(SUM(s.outstanding_balance),0) AS outstanding_balance FROM vendors v LEFT JOIN sales s ON s.vendor_id=v.vendor_id GROUP BY v.vendor_id,v.vendor_name ORDER BY outstanding_balance DESC');return r;}
module.exports={topFruits,revenue,topVendor,stock,balances};

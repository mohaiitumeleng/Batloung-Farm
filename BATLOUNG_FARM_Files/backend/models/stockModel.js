const {pool}=require('../config/db');
const base=`SELECT s.stock_id,s.fruit_id,f.fruit_name,f.status,s.packaging_size,s.available_quantity,CASE s.packaging_size WHEN 'SMALL' THEN f.price_small WHEN 'MEDIUM' THEN f.price_medium ELSE f.price_large END AS selling_price FROM stock s JOIN fruits f ON f.fruit_id=s.fruit_id`;
async function all(){const [rows]=await pool.query(base+" ORDER BY f.fruit_id,FIELD(s.packaging_size,'SMALL','MEDIUM','LARGE')");return rows;}
async function byFruit(id){const [rows]=await pool.query(base+" WHERE s.fruit_id=? ORDER BY FIELD(s.packaging_size,'SMALL','MEDIUM','LARGE')",[id]);return rows;}
async function low(n){const [rows]=await pool.query(base+' WHERE s.available_quantity<=? ORDER BY s.available_quantity,f.fruit_name',[n]);return rows;}
module.exports={all,byFruit,low};

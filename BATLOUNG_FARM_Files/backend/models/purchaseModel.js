const {pool}=require('../config/db');
const {fail}=require('../middleware/errors');
async function all(){const [r]=await pool.query('SELECT p.*,s.business_name AS supplier_name FROM purchases p JOIN suppliers s ON p.supplier_id=s.supplier_id ORDER BY p.purchase_id DESC');return r;}
async function byId(id){const [r]=await pool.query('SELECT p.*,s.business_name AS supplier_name FROM purchases p JOIN suppliers s ON p.supplier_id=s.supplier_id WHERE p.purchase_id=?',[id]);if(!r.length)return null;const [items]=await pool.query('SELECT d.*,f.fruit_name,(d.quantity*d.unit_cost) AS line_total FROM purchase_details d JOIN fruits f ON f.fruit_id=d.fruit_id WHERE d.purchase_id=? ORDER BY d.purchase_detail_id',[id]);return {...r[0],items};}
async function create(data){const c=await pool.getConnection();try{await c.beginTransaction();const [sup]=await c.query('SELECT supplier_id FROM suppliers WHERE supplier_id=?',[data.supplier_id]);if(!sup.length)throw fail('Supplier not found.',404);const items=[...data.items].sort((a,b)=>a.fruit_id-b.fruit_id||a.packaging_size.localeCompare(b.packaging_size));let cents=0;
for(const item of items){
const [prices]=await c.query('SELECT unit_cost FROM supplier_prices WHERE supplier_id=? AND fruit_id=? AND packaging_size=?',[data.supplier_id,item.fruit_id,item.packaging_size]);
if(!prices.length)throw fail(`Set a supplier price for fruit ${item.fruit_id} (${item.packaging_size}) before purchasing.`,409);
const costText=String(prices[0].unit_cost);const [whole,frac='']=costText.split('.');
item.unitCostCents=Number(whole)*100+Number(frac.padEnd(2,'0'));
if(!Number.isSafeInteger(item.unitCostCents))throw fail('Stored supplier price is invalid.',500);
cents+=item.quantity*item.unitCostCents;if(!Number.isSafeInteger(cents)||cents>999999999999)throw fail('Purchase total exceeds limit.');const [r]=await c.query('SELECT s.stock_id,f.status FROM stock s JOIN fruits f ON f.fruit_id=s.fruit_id WHERE s.fruit_id=? AND s.packaging_size=? FOR UPDATE',[item.fruit_id,item.packaging_size]);if(!r.length||r[0].status!=='AVAILABLE')throw fail('Fruit stock record missing or fruit unavailable.',409);}
const [r]=await c.query('INSERT INTO purchases (supplier_id,purchase_date,total_amount) VALUES (?,NOW(),?)',[data.supplier_id,(cents/100).toFixed(2)]);
for(const item of items){await c.query('INSERT INTO purchase_details (purchase_id,fruit_id,quantity,unit_cost,packaging_size) VALUES (?,?,?,?,?)',[r.insertId,item.fruit_id,item.quantity,(item.unitCostCents/100).toFixed(2),item.packaging_size]);const [u]=await c.query('UPDATE stock SET available_quantity=available_quantity+? WHERE fruit_id=? AND packaging_size=? AND available_quantity<=2147483647-?',[item.quantity,item.fruit_id,item.packaging_size,item.quantity]);if(u.affectedRows!==1)throw fail('Unable to update stock.',409);}
await c.commit();return byId(r.insertId);}catch(e){await c.rollback();throw e;}finally{c.release();}}
module.exports={all,byId,create};

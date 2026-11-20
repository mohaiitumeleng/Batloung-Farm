const {pool}=require('../config/db');
const table='vendors', pk='vendor_id';
const cols=["vendor_name", "phone_number", "location", "registration_date"];
async function all(){const [rows]=await pool.query(`SELECT * FROM ${table} ORDER BY ${pk}`);return rows;}
async function byId(id){const [rows]=await pool.query(`SELECT * FROM ${table} WHERE ${pk}=?`,[id]);return rows[0]||null;}
async function create(data){const [r]=await pool.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,cols.map(c=>data[c]));return byId(r.insertId);}
async function update(id,data){const [r]=await pool.query(`UPDATE ${table} SET ${cols.map(c=>c+'=?').join(',')} WHERE ${pk}=?`,[...cols.map(c=>data[c]),id]);return r.affectedRows?byId(id):null;}
async function remove(id){const [r]=await pool.query(`DELETE FROM ${table} WHERE ${pk}=?`,[id]);return r.affectedRows;}
async function search(q){const escaped=q.replace(/[\%_]/g,'\\$&');const like=`%${escaped}%`;const [rows]=await pool.query('SELECT * FROM vendors WHERE vendor_name LIKE ? OR phone_number LIKE ? ORDER BY vendor_id',[like,like]);return rows;}
module.exports={all,byId,create,update,remove,search};

require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = mysql.createPool({host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'batloung_farm', waitForConnections:true, connectionLimit:10, decimalNumbers:false});
async function testConnection(){try {const c=await pool.getConnection(); await c.ping(); c.release(); console.log('MySQL database connected successfully!');return true;}catch(e){console.error('MySQL connection failed:', e.message);return false;}}
module.exports={pool,testConnection};

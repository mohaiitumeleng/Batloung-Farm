const router=require('express').Router();
const {pool}=require('../config/db');
const {fail,id,moneyCents,asyncHandler}=require('../middleware/errors');
router.get('/:supplierId',asyncHandler(async(req,res)=>{
 if(!id(req.params.supplierId)) throw fail('Invalid supplier ID.');
 const [rows]=await pool.query(`SELECT supplier_id,fruit_id,packaging_size,unit_cost FROM supplier_prices WHERE supplier_id=? ORDER BY fruit_id,FIELD(packaging_size,"SMALL","MEDIUM","LARGE")`,[req.params.supplierId]);
 res.json(rows);
}));
router.put('/:supplierId',asyncHandler(async(req,res)=>{
 if(!id(req.params.supplierId)) throw fail('Invalid supplier ID.');
 const d=req.body;
 if(!d||!id(d.fruit_id)||!['SMALL','MEDIUM','LARGE'].includes(d.packaging_size))throw fail('Select a valid fruit and box size.');
 const cents=moneyCents(d.unit_cost);
 if(cents===null||cents>999999999)throw fail('Enter a valid price per box up to M9,999,999.99.');
 const [sup]=await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id=?',[req.params.supplierId]);
 if(!sup.length)throw fail('Supplier not found.',404);
 const [fruit]=await pool.query('SELECT fruit_id FROM fruits WHERE fruit_id=?',[d.fruit_id]);
 if(!fruit.length)throw fail('Fruit not found.',404);
 await pool.query('INSERT INTO supplier_prices (supplier_id,fruit_id,packaging_size,unit_cost) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE unit_cost=VALUES(unit_cost)',[req.params.supplierId,d.fruit_id,d.packaging_size,(cents/100).toFixed(2)]);
 res.json({message:'Supplier box price saved.'});
}));
router.delete('/:supplierId/:fruitId/:size',asyncHandler(async(req,res)=>{
 if(!id(req.params.supplierId)||!id(req.params.fruitId)||!['SMALL','MEDIUM','LARGE'].includes(req.params.size))throw fail('Invalid price record.');
 const [r]=await pool.query('DELETE FROM supplier_prices WHERE supplier_id=? AND fruit_id=? AND packaging_size=?',[req.params.supplierId,req.params.fruitId,req.params.size]);
 if(!r.affectedRows)throw fail('Supplier price not found.',404);
 res.json({message:'Price removed.'});
}));
module.exports=router;

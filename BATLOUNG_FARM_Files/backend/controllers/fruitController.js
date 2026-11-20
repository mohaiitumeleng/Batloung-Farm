const model=require('../models/fruitModel');
const {fail,id,requiredString,asyncHandler,moneyCents}=require('../middleware/errors');
function validate(d){if(!d||!requiredString(d.fruit_name,100))throw fail('Fruit name is required.');if(!['AVAILABLE','UNAVAILABLE'].includes(d.status))throw fail('Status must be AVAILABLE or UNAVAILABLE.');const vals=['price_small','price_medium','price_large'].map(k=>moneyCents(d[k]));if(vals.some(v=>v===null)||new Set(vals).size!==3)throw fail('Enter three distinct valid prices.');}
exports.getAll=asyncHandler(async(req,res)=>res.json(await model.all()));
exports.getById=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid fruit ID.');const x=await model.byId(req.params.id);if(!x)throw fail('Fruit not found.',404);res.json(x);});
exports.create=asyncHandler(async(req,res)=>{const d={...req.body,status:req.body?.status||'AVAILABLE'};validate(d);res.status(201).json(await model.create(d));});
exports.update=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid fruit ID.');validate(req.body);const x=await model.update(req.params.id,req.body);if(!x)throw fail('Fruit not found.',404);res.json(x);});
exports.remove=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid fruit ID.');const n=await model.remove(req.params.id);if(!n)throw fail('Fruit not found.',404);res.json({message:'Fruit deleted successfully.'});});

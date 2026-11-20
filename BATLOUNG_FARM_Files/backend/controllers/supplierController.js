const model=require('../models/supplierModel');
const {fail,id,requiredString,asyncHandler}=require('../middleware/errors');
function validate(d){if(!d||typeof d!=='object'||Array.isArray(d)||!(requiredString(d.business_name,100) && requiredString(d.contact_person,100) && requiredString(d.phone,20) && requiredString(d.province,50) && requiredString(d.address,255)))throw fail('Required supplier fields are missing or invalid.');}
exports.getAll=asyncHandler(async(req,res)=>res.json(await model.all()));
exports.getById=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');const item=await model.byId(req.params.id);if(!item)throw fail('Supplier not found.',404);res.json(item);});
exports.create=asyncHandler(async(req,res)=>{validate(req.body);const d={...req.body};res.status(201).json(await model.create(d));});
exports.update=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');validate(req.body);const original=await model.byId(req.params.id);if(!original)throw fail('Supplier not found.',404);const d={...req.body};res.json(await model.update(req.params.id,d));});
exports.remove=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');const deleted=await model.remove(req.params.id);if(!deleted)throw fail('Supplier not found.',404);res.json({message:'Supplier deleted successfully.'});});

const model=require('../models/vendorModel');
const {fail,id,requiredString,asyncHandler}=require('../middleware/errors');
function validate(d){if(!d||typeof d!=='object'||Array.isArray(d)||!(requiredString(d.vendor_name,100) && requiredString(d.phone_number,20) && requiredString(d.location,150)))throw fail('Required vendor fields are missing or invalid.');}
exports.getAll=asyncHandler(async(req,res)=>res.json(await model.all()));
exports.getById=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');const item=await model.byId(req.params.id);if(!item)throw fail('Vendor not found.',404);res.json(item);});
exports.create=asyncHandler(async(req,res)=>{validate(req.body);const d={...req.body};if(d.registration_date&&!/^\d{4}-\d{2}-\d{2}$/.test(d.registration_date))throw fail('Use YYYY-MM-DD for registration date.');d.registration_date=d.registration_date||new Date().toISOString().slice(0,10);res.status(201).json(await model.create(d));});
exports.update=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');validate(req.body);const original=await model.byId(req.params.id);if(!original)throw fail('Vendor not found.',404);const d={...req.body};const date=d.registration_date||original.registration_date;d.registration_date=new Date(date).toISOString().slice(0,10);res.json(await model.update(req.params.id,d));});
exports.remove=asyncHandler(async(req,res)=>{if(!id(req.params.id))throw fail('Invalid ID.');const deleted=await model.remove(req.params.id);if(!deleted)throw fail('Vendor not found.',404);res.json({message:'Vendor deleted successfully.'});});
exports.search=asyncHandler(async(req,res)=>{const q=req.query.q;if(!requiredString(q,100))throw fail("A search term is required.");res.json(await model.search(q));});

const m=require('../models/reportModel');const {fail,asyncHandler}=require('../middleware/errors');
exports.topFruits=asyncHandler(async(req,res)=>res.json(await m.topFruits()));
exports.revenue=asyncHandler(async(req,res)=>{const {start,end}=req.query;if(!/^\d{4}-\d{2}-\d{2}$/.test(start||'')||!/^\d{4}-\d{2}-\d{2}$/.test(end||'')||start>end)throw fail('Provide start and end as YYYY-MM-DD, with start <= end.');res.json(await m.revenue(start,end));});
exports.topVendor=asyncHandler(async(req,res)=>res.json(await m.topVendor()));
exports.stock=asyncHandler(async(req,res)=>res.json(await m.stock()));
exports.balances=asyncHandler(async(req,res)=>res.json(await m.balances()));

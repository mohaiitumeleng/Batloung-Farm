const model=require('../models/stockModel');const Fruit=require('../models/fruitModel');const {fail,id,asyncHandler}=require('../middleware/errors');
exports.getAll=asyncHandler(async(req,res)=>res.json(await model.all()));
exports.getByFruitId=asyncHandler(async(req,res)=>{if(!id(req.params.fruitId))throw fail('Invalid fruit ID.');if(!await Fruit.byId(req.params.fruitId))throw fail('Fruit not found.',404);res.json(await model.byFruit(req.params.fruitId));});
exports.getLow=asyncHandler(async(req,res)=>{const n=Number(req.query.threshold??10);if(!Number.isSafeInteger(n)||n<0||n>1000000)throw fail('Invalid threshold.');const items=await model.low(n);res.json({threshold:n,total:items.length,items});});

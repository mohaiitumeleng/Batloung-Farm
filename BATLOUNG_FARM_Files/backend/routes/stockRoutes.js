const r=require('express').Router(),c=require('../controllers/stockController');r.get('/',c.getAll);r.get('/low',c.getLow);r.get('/:fruitId',c.getByFruitId);module.exports=r;

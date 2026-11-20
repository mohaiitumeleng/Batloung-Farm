const r=require('express').Router(),c=require('../controllers/purchaseController');r.get('/',c.getAll);r.get('/:id',c.getById);r.post('/',c.create);module.exports=r;

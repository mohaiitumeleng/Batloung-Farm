const r=require('express').Router(),c=require('../controllers/paymentController');r.get('/outstanding',c.outstanding);r.post('/:saleId',c.add);module.exports=r;

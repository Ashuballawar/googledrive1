const express=require('express');


const router=express.Router();
const controller=require('../controller/controllerdata')


router.get('/download',controller.getdata);
module.exports=router;
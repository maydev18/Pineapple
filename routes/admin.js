const express = require('express');

const router = express.Router();
const isauth = require("../middlewares/isauth");
const isadmin = require("../middlewares/isadmin");
const adminController = require("../controllers/adminController");
const {body} = require("express-validator");
router.put("/add-product" ,
    isauth ,
    isadmin ,
    [
        body('title').trim().toLowerCase(),
        body('description').trim().toLowerCase(),
        body('price').trim().isInt({min : 50 , max : 100000}).withMessage("Please enter only appropriate price"),
        body('small').trim().isInt({min : 0 , max : 10000}).withMessage("Please enter only appropriate quantity of small"),
        body('medium').trim().isInt({min : 0 , max : 10000}).withMessage("Please enter only appropriate quantity of medium"),
        body('large').trim().isInt({min : 0 , max : 10000}).withMessage("Please enter only appropriate quantity of large"),
        body('extraLarge').trim().isInt({min : 0 , max : 10000}).withMessage("Please enter only appropriate quantity of extra large"),
        body('doubleExtraLarge').trim().isInt({min : 0 , max : 10000}).withMessage("Please enter only appropriate quantity of double extra large"),
    ], 
    adminController.addProduct
);






module.exports = router;
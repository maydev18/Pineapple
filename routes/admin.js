const express = require('express');

const router = express.Router();
const isauth = require("../middlewares/isauth");
const isadmin = require("../middlewares/isadmin");
const adminController = require("../controllers/adminController");
const {body} = require("express-validator");
const multer = require("multer");
const multerSetup = require('../utils/multerSetup');

const upload = multer({
    storage : multerSetup.fileStorge,
    fileFilter : multerSetup.fileFilter
});
const productDetailErrorPipeline = [
    body('title').trim().isLength({min:5 , max : 150}).withMessage("Please enter title of length 5-150").toLowerCase(),
    body('description').trim().isLength({min:20 , max: 1500}).withMessage("Please enter description of length 20-1500").toLowerCase(),
    body('price').isInt({min : 100 , max : 10000}).withMessage("Please enter a correct value of price"),
    body('small').isInt({min : 0 , max : 10000}).withMessage("Please enter a correct value of small size"),
    body('medium').isInt({min : 0 , max : 10000}).withMessage("Please enter a correct value of medium size"),
    body('large').isInt({min : 0 , max : 10000}).withMessage("Please enter a correct value of large size"),
    body('extraLarge').isInt({min : 0 , max : 10000}).withMessage("Please enter a correct value of extra large size"),
    body('doubleExtraLarge').isInt({min : 0 , max : 10000}).withMessage("Please enter a correct value of double extra large size"),
    body('size').trim().toLowerCase(),
    body('fit').trim().toLowerCase(),
    body('specifications').trim().toLowerCase(),
    body('washCare').trim().toLowerCase()
];
router.put("/add-product" ,
    isauth ,
    isadmin ,
    upload.array('productImages', 10),
    productDetailErrorPipeline,
    adminController.addProduct
);
router.post("/edit-product" , 
    isauth,
    isadmin,
    productDetailErrorPipeline,
    adminController.editProduct
)

router.get("/orders" , isauth , isadmin , adminController.getOrders);
router.post("/complete-order" , isauth , isadmin , adminController.completeOrder);




module.exports = router;
const express = require('express');

const router = express.Router();
const isauth = require("../middlewares/isauth");
const shopController = require("../controllers/shopController");
const {body} = require("express-validator");
const Product = require("../models/product")

router.get("/products" , shopController.getProducts);
router.get("/product/:productID" , shopController.getProduct);

router.get("/cart" , isauth , shopController.getCart);
router.post("/addToCart" , isauth , shopController.addToCart);
router.post("/deleteFromCart" , isauth , shopController.deleteFromCart);

const addressValidator = [
    body('firstLine').trim().isLength({min:10 , max : 1000}).withMessage("Please enter firstLine of address of length 10-1000").toLowerCase(),
    body('secondLine').trim().toLowerCase(),
    body('pincode' , "Please enter a valid pincode").trim().escape().isNumeric().isLength({min : 6 , max : 6}),
    body('phone' , "Please enter a valid phone number").trim().escape().isNumeric().isLength({min : 10 , max : 10}),
    body('city' , "Please enter a valid city").trim().escape().isLength({min:2 , max:100}).toLowerCase(),
    body('fullName' , "Please enter a valid full-name").trim().escape().isLength({min : 2 , max : 200}).toLowerCase(),
    body('landmark' , "please enter a valid landmark").trim().escape().isLength({min : 2 , max : 300}).toLowerCase(),
    body('state' , "Please eneter a valid state name").trim().escape().isLength({min: 2 , max : 50}).toLowerCase()
];
router.post("/add-address" , isauth , addressValidator , shopController.addAddress);
router.post("/edit-address" , isauth , addressValidator , shopController.editAddress);
router.get("/get-addresses" , isauth , shopController.getAddress);
router.delete("/delete-address" , isauth , shopController.deleteAddress);
module.exports = router;
const express = require('express');

const router = express.Router();
const isauth = require("../middlewares/isauth");
const shopController = require("../controllers/shopController");
const {body , query} = require("express-validator");
const Product = require("../models/product")

const addressValidator = [
    body('firstLine').trim().isLength({min:10 , max : 1000}).withMessage("Please enter firstLine of address of length 10-1000").toLowerCase(),
    body('secondLine').trim().toLowerCase(),
    body('pincode' , "Please enter a valid pincode").trim().escape().isNumeric().isLength({min : 6 , max : 6}),
    body('phone' , "Please enter a valid phone number").trim().escape().isNumeric().isLength({min : 10 , max : 10}),
    body('email' , "Please enter a valid email address").trim().escape().normalizeEmail().isEmail(),
    body('city' , "Please enter a valid city").trim().escape().isLength({min:2 , max:100}).toLowerCase(),
    body('fullName' , "Please enter a valid full-name").trim().escape().isLength({min : 2 , max : 200}).toLowerCase(),
    body('landmark' , "please enter a valid landmark").trim().escape().isLength({min : 2 , max : 300}).toLowerCase(),
    body('state' , "Please eneter a valid state name").trim().escape().isLength({min: 2 , max : 50}).toLowerCase()
];
const reviewValidator = [
    body('stars').trim().isInt({min : 1 , max : 5}).withMessage("please enter a star value between 1 to 5"),
    body('content').trim().isLength({min : 1 , max : 1000}),
    body('buyer').trim().isLength({min : 2 , max : 100}).withMessage("please enter your correct full name").toLowerCase(),
];
const returnEmptyCartIfUserLoggedOut = (req , res , next) => {
    const authHeader = req.get("Authorization");
    const token = authHeader.split(" ")[1];
    if(token === 'null'){
        return res.status(200).json({
            cart : [],
            total : 0,
            quantity : 0,
            discount : 0
        })
    }
    next();
}
router.get("/products" , shopController.getProducts);
router.get("/top-products" , shopController.getHomePageProducts);
router.get("/product/:productID" , shopController.getProduct);
router.get("/cart" ,returnEmptyCartIfUserLoggedOut, isauth , shopController.getCart);
router.post("/add-to-cart" , isauth  , shopController.addToCart);
router.post("/delete-from-Cart" , isauth  , shopController.deleteFromCart);
router.post("/add-address" , isauth , addressValidator , shopController.addAddress);
router.post("/edit-address" , isauth , addressValidator , shopController.editAddress);
router.get("/get-addresses" , isauth , shopController.getAddress);
router.delete("/delete-address" , isauth , shopController.deleteAddress);
router.get("/checkout" , isauth , [query('method').toLowerCase()] ,  shopController.checkout);
router.post("/create-order" , isauth , shopController.createOrder);
router.get("/orders" , isauth , shopController.getOrders);

router.post("/post-review" , isauth , reviewValidator , shopController.postReview);
router.get("/reviews/:productID" , shopController.getReviews);
router.post("/cancel-order" , isauth , shopController.markOrderCancelled);
module.exports = router;
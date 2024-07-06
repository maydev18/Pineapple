const express = require('express');

const router = express.Router();
const isauth = require("../middlewares/isauth");
const shopController = require("../controllers/shopController");
const {body} = require("express-validator");


router.get("/products" , shopController.getProducts);
router.get("/product/:productID" , shopController.getProduct);

module.exports = router;
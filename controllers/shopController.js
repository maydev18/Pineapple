const Product = require("../models/product");
const User = require("../models/user");
const Address = require("../models/address");
const {matchedData, validationResult} = require("express-validator");
const Razorpay = require('razorpay');
const Order = require('../models/order');
const crypto = require('crypto');
const Review = require("../models/review");
const paymentUtil = require('../utils/paymentVerify');
const mongoose = require('mongoose')
const ShipRocket = require('./Helper/shiprocket/shiprocket');
const { disconnect } = require("process");
const {mail} = require("../utils/sendEmail");
const ITEMS_PER_PAGE = 15;
exports.getProducts = async (req ,res , next) => {
    try{
        const page = +req.query.page || 1;
        const totalProducts = await Product.find({visible : true}).countDocuments();
        const productsToSkip = (page-1) * ITEMS_PER_PAGE;

        if(totalProducts == 0){
            return res.status(404).json({message : "Products not found"});
        }
        const products = await Product.find({visible : true}).select('_id title price mainImage backImage small medium large extraLarge doubleExtraLarge').skip(productsToSkip).limit(ITEMS_PER_PAGE);
        return res.status(200).json({
            products : products,
            currentPage : page,
            totalPages : Math.ceil(totalProducts/ITEMS_PER_PAGE)
        })
    }
    catch(err){
        next(err);
    }
}

exports.getProduct = async (req , res , next) => {
    try{
        const productID = req.params.productID;
        const product = await Product.findById(productID);
        if(!product){
            return res.status(404).json({
                message : "Product not found with the given ID"
            })
        }
        return res.status(200).json({product : product });
    }
    catch(err){
        next(err);
    }
}
exports.getHomePageProducts = async (req ,res , next) => {
    try{
        const products = await Product.find({top : true}).select('_id title price mainImage backImage');
        return res.status(200).json({products : products});
    }
    catch(err){
        next(err);
    }
}

exports.getCart = async(req , res , next) => {
    try{
        const userID = req.userID;
        const cart = await User.findById(userID).select('cart').populate({
            path: 'cart.productID',
            select: 'title price mainImage' 
        })
        const {payable , totalCartItems , discount} = paymentUtil.getTotalCartValue(cart.cart);
        return res.status(200).json({
            cart : cart.cart,
            total : payable,
            quantity : totalCartItems,
            discount : discount
        });
    }
    catch(err){
        next(err);
    }
}

exports.addToCart = async (req , res , next) => {
    try{
        const userID = req.userID;
        const productID = req.body.productID;
        const size = req.body.size;
        if(size !== 'small' && size !== 'medium' && size !== 'large' && size !== 'extraLarge' && size !== 'doubleExtraLarge'){
            const err = new Error("please enter a valid size");
            err.statusCode = 422;
            throw err;
        }
        const user = await User.findById(userID);
        await user.addToCart(productID , size);
        const updatedUser = await User.findById(userID).populate({
            path: 'cart.productID',
            select: 'title price mainImage'
        });
        const {payable , totalCartItems , discount} = paymentUtil.getTotalCartValue(updatedUser.cart);
        return res.status(200).json({
            cart : updatedUser.cart,
            total : payable,
            quantity : totalCartItems,
            discount : discount
        });
    }
    catch(err){
        next(err);
    }
}

exports.deleteFromCart = async(req , res , next) => {
    try{
        const userID = req.userID;
        const productID = req.body.productID;
        const size = req.body.size;
        if(size !== 'small' && size !== 'medium' && size !== 'large' && size !== 'extraLarge' && size !== 'doubleExtraLarge'){
            const err = new Error("please enter a valid size");
            err.statusCode = 422;
            throw err;
        }
        const user = await User.findById(userID);
        await user.deleteFromCart(productID , size);
        const updatedUser = await User.findById(userID).populate({
            path: 'cart.productID',
            select: 'title price mainImage'
        });
        const {payable , totalCartItems , discount} = paymentUtil.getTotalCartValue(updatedUser.cart);
        return res.status(200).json({
            cart : updatedUser.cart,
            total : payable,
            quantity : totalCartItems,
            discount : discount


        });
    }
    catch(err){
        next(err);
    }
}


exports.addAddress = async(req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const userID = req.userID;
        const data = matchedData(req);
        const address = await Address.create({
            userID : userID.toString(),
            fullName : data.fullName,
            firstLine : data.firstLine,
            secondLine : data.secondLine ? data.secondLine : "",
            state : data.state,
            city : data.city,
            phone : data.phone,
            pincode : data.pincode,
            landmark : data.landmark ? data.landmark : "",
            email : data.email
        })
        const user = await User.findByIdAndUpdate(userID , {
            $push : {
                addresses : {
                    addressID : address._id
                }
            }
        });
        return res.status(201).json(address);
    }
    catch(err){
        next(err);
    }
}

exports.editAddress = async(req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const addressID = req.body.addressID;
        const data = matchedData(req);
        const address = await Address.findByIdAndUpdate(addressID , {
            fullName : data.fullName,
            firstLine : data.firstLine,
            secondLine : data.secondLine ? data.secondLine : "",
            state : data.state,
            city : data.city,
            phone : data.phone,
            pincode : data.pincode,
            landmark : data.landmark ? data.landmark : "",
            email : data.email
        } ,{new : true})
        return res.status(200).json(address);
    }
    catch(err){
        next(err);
    }
}

exports.getAddress = async (req , res , next) =>{
    try{
        const userID = req.userID;
        const addresses = await Address.find({userID : userID});
        res.status(200).json(addresses);
    }
    catch(err){
        next(err);
    }
}

exports.deleteAddress = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const userID = req.userID;
        const addressID = req.body.addressID;
        await User.findByIdAndUpdate(userID , {
            $pull : {
                addresses : {
                    addressID : addressID
                }
            }
        });
        await Address.deleteOne({_id : addressID});
        res.status(200).json({
            message : "Address deleted successfully"
        });
    }
    catch(err){
        next(err);
    }
}
function checkOutOfStock(cart){
    if(cart.length === 0){
        throw new Error("Cart cannot be empty");
    }
    for(cartItems of cart){
        if(cartItems.quantity > cartItems.productID[cartItems.size]){
            throw new Error(cartItems.productID.title + " is out of stock please try later or remove it from your cart to continue ahead");
        }
    }
}
exports.checkout = async(req , res , next) => {
    try{
        const userID = req.userID;
        const cart = await User.findById(userID).select('cart').populate("cart.productID");
        //checking if out of stock
        checkOutOfStock(cart.cart);
        let total = paymentUtil.getTotalCartValue(cart.cart).payable;
        const instance = new Razorpay({
            key_id : process.env.PAYMENT_ID,
            key_secret :  process.env.PAYMENT_SECRET,
        });
        const options = {
            amount: total * 100,
            currency: "INR",
            // receipt: order._id
        };
        instance.orders.create(options, function(err, order) {
            if(err){
                throw err;
            }
            return res.status(200).json(order);
        });
    }
    catch(err){
        next(err);
    }
}

exports.createOrder = async (req , res , next) => {
    try{
        const paymentID = req.body.paymentID;
        const orderID = req.body.orderID;
        const signature = req.body.signature;
        const addressID = req.body.addressID;
        const paymentMethod = req.body.method;
        if(paymentMethod !== 'cod' && paymentMethod !== 'prepaid'){
            return res.status(400).json({message : "Please enter a valid payment method"});
        }
        if(paymentMethod === 'prepaid' && !(paymentUtil.validatePayment(paymentID , orderID , signature))){
            return res.status(422).json({message : "Payment signature cannot be verified"});
        }
        const address = await Address.findById(addressID);
        const user = await User.findById(req.userID).populate("cart.productID");
        //checking if out of stock or not
        checkOutOfStock(user.cart);
        const orderproducts = user.cart.map(item  => {
            return {
                _id: item.productID._id,
                price: item.productID.price,
                quantity: item.quantity,
                size: item.size,
                image : item.productID.mainImage,
                title : item.productID.title,
                reviewed : false,
            };  
        });
        const {payable , total , totalCartItems} = paymentUtil.getTotalCartValue(user.cart);
        let orderValue = payable;
        if(paymentMethod === 'cod'){
            orderValue += 100;
        }
        let orderDetails = {
            products : orderproducts,
            address : address,
            userID : req.userID,
            paymentID : paymentID ? paymentID : "CODPAY" + Date.now(),
            orderID : orderID ? orderID : "CODORDER" + Date.now(),
            method : paymentMethod,
            total : orderValue
        };
        const shipRocketData = await ShipRocket.createShipRocketOrder(orderDetails , payable , total , totalCartItems);
        orderDetails = {
            ...orderDetails , 
            shipRocketOrderID : shipRocketData.order_id,
            shipmentID : shipRocketData.shipment_id
        }
        user.cart = [];
        user.save();

        //decreasing the quantity of bought products in the inventory

        for(const order of orderproducts){
            await Product.findOneAndUpdate({_id : order._id} , {
                    $inc : {
                        [order.size] : -order.quantity
                    }
                },
                {new : false}
            );
        }

        //creating order at backend
        const order = Order.create(orderDetails);

        //sending email to admin
        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            subject: 'New Order Received',
            html : `
                <h3> ${orderDetails.orderID} is placed on the website</h3>
                <br>
                <p> Follow this link https://www.thepineapple.in/admin/placedorder to get order details</p>
            `
        };
        mail(mailOptions);
        return res.status(201).json();
    }
    catch(err){
        next(err);
    }
}

exports.getOrders = async(req ,res , next) => {
    try{
        const orders = await Order.find({userID : req.userID}).select('-_id');
        return res.status(200).json(orders);
    }
    catch(err){
        next(err);
    }
}

exports.postReview = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const stars = req.body.stars;
        const content = req.body.content;
        const productID = req.body.productID;
        const size = req.body.size;
        const buyer = req.body.buyer;
        const orderID = req.body.orderID;
        const result = await Order.updateOne(
            { 
              orderID: orderID, 
              products: { $elemMatch: { _id: new mongoose.Types.ObjectId(productID) , size : size , reviewed : false} } 
            },
            { $set: { "products.$.reviewed": true } }
        );
        const review = await Review.create({
            stars : stars,
            content : content,
            userID : req.userID,
            productID : productID,
            buyer : buyer
        });
        return res.status(201).json(review);
    }
    catch(err){
        next(err);
    }
}
exports.getReviews = async (req , res , next) => {
    try{
        const productID = req.params.productID;
        const reviews = await Review.find({productID : productID}).select("-userID -productID");
        res.status(200).json(reviews);
    }
    catch(err){
        next(err);
    }
}

exports.markOrderCancelled = async(req , res , next) => {
    try{    
        const orderID = req.body.orderID;
        const order = await Order.findOneAndUpdate(
            {
            orderID : orderID, 
            cancelled : false,
            status : 0
            },
            {
                $set : {cancelled : true}
            },
            {
                new : true
            }
        );
        ShipRocket.cancelOrder(order.shipRocketOrderID);
        if(!order){
            throw new Error("Cannot cancel the given order");
        }
        return res.status(201).json({message : "order cancelled successfully"});
    }
    catch(err){
        next(err);
    }
}



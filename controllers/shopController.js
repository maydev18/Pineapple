const Product = require("../models/product");
const User = require("../models/user");
const ITEMS_PER_PAGE = 10;
const Address = require("../models/address");
const {matchedData, validationResult} = require("express-validator");
const Razorpay = require('razorpay');
const Order = require('../models/order');
const crypto = require('crypto');
const Review = require("../models/review");
exports.getProducts = async (req ,res , next) => {
    try{
        const page = +req.query.page || 1;
        const totalProducts = await Product.find().countDocuments();
        const productsToSkip = (page-1) * ITEMS_PER_PAGE;

        if(totalProducts == 0){
            return res.status(404).json({message : "Products not found"});
        }
        const products = await Product.find().select('_id title price mainImage').skip(productsToSkip).limit(ITEMS_PER_PAGE);
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
        return res.status(200).send({product : product });
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
        const user = await User.findById(userID);
        await user.addToCart(productID , size);
        res.status(200).json({
            message : "Item added to the cart"
        })
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
        const user = await User.findById(userID);
        await user.deleteFromCart(productID , size);
        res.status(200).json({
            message : "Item removed to the cart"
        })
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
        return res.status(200).json(cart.cart);
    }
    catch(err){
        next(err);
    }
}

exports.addAddress = async(req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            console.log(err.array());
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
            console.log(err.array());
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
        const addresses = await User.findById(userID).select('addresses').populate("addresses.addressID");
        res.status(200).json(addresses);
    }
    catch(err){
        next(err);
    }
}

exports.deleteAddress = async (req , res , next) => {
    try{
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
exports.checkout = async(req , res , next) => {
    try{
        const userID = req.userID;
        const cart = await User.findById(userID).select('cart').populate("cart.productID");
        let total = 0;
        for(cartItems of cart.cart){
            total += (cartItems.quantity * cartItems.productID.price);
        }
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
exports.validatePayment = async (req , res , next) => {
    try{
        const paymentID = req.body.paymentID;
        const orderID = req.body.orderID;
        const signature = req.body.signature;
        const sha = crypto.createHmac("sha256" , process.env.PAYMENT_SECRET);
        sha.update(`${orderID}|${paymentID}`);
        const digest = sha.digest("hex");
        if(digest !== signature){
            res.status(403).json({
                message : "signatures does not match payment failed"
            })
        }
        else{
            res.status(200).json({
                message : "payment done successfully",
                orderID : orderID,
                paymentID : paymentID
            })
        }
    }
    catch(err){
        next(err);
    }
}
exports.createOrder = async (req , res , next) => {
    try{
        const paymentID = req.body.paymentID;
        const orderID = req.body.orderID;
        const addressID = req.body.addressID;
        const address = await Address.findById(addressID);
        const user = await User.findById(req.userID).populate("cart.productID");
        const orderproducts = user.cart.map(item  => {
            return {
                _id: item.productID._id,
                price: item.productID.price,
                quantity: item.quantity,
                size: item.size
            };  
        });
        user.cart = [];
        await user.save();
        const order = await Order.create({
            products : orderproducts,
            address : address,
            userID : req.userID,
            paymentID : paymentID,
            orderID : orderID
        })
        for(const order of orderproducts){
            await Product.findOneAndUpdate({_id : order._id} , {
                    $inc : {
                        [order.size] : -order.quantity
                    }
                },
                {new : false}
            );
        }
        return res.status(201).json(order);
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
            console.log(err.array());
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const stars = req.body.stars;
        const content = req.body.content;
        const productID = req.body.productID;
        const buyer = req.body.buyer;
        const review = await Review.create({
            stars : stars,
            content : content,
            userID : req.userID,
            productID : productID,
            buyer : buyer
        })
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
exports.getUserReview = async(req , res , next) => {
    try{
        const productID = req.params.productID;
        const userID = req.userID;
        const userReviews = await Review.find({productID : productID , userID : userID}).select("-userID -productID");
        res.status(200).json(userReviews);
    }
    catch(err){
        next(err);
    }
}

exports.deleteReview = async (req , res , next) => {
    try{
        await Review.findByIdAndDelete(req.body.reviewID);
        res.status(204).json();
    }
    catch(err){
        next(err);
    }
}
exports.editReview = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            console.log(err.array());
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const stars = req.body.stars;
        const content = req.body.content;
        const buyer = req.body.buyer;
        const _id = req.body.reviewID;
        const review = await Review.findByIdAndUpdate(_id , {
            stars : stars,
            content : content,
            buyer : buyer
        }, {
            new : true
        })
        return res.status(200).json(review);
    }
    catch(err){
        next(err);
    }
}
exports.canReview = async (req , res , next) => {
    try{
        const productID = req.params.productID;
        const orders = await Order.find({userID : req.userID});
        let review = false;
        console.log(orders);
        for(const order of orders){
            if(order.completed){
                for(const product of order.products){
                    if(product._id.toString() === productID.toString()){
                        review = true;
                        break;
                    }
                }
            }
            if(review) break;
        }
        res.status(200).json(review);
    }
    catch(err){
        next(err);
    }
}
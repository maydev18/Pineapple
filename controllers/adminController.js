const Product = require("../models/product");
const {validationResult ,matchedData} = require("express-validator");
const Order = require("../models/order");
const mongoose = require("mongoose");
exports.getProducts = async (req , res , next) => {
    try{
        const pro = await Product.find();
        return res.status(200).json(pro);
    }
    catch(err){
        next(err);
    }
}
exports.addProduct = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        if (req.files.length  < 2) {
            return res.status(400).json({
                message : "Please enter " + (2 - req.files.length) + " more files ",
                product_added : false
            })
        }
        const filePaths = req.files.map(file => `${process.env.BASE_URL}/${file.filename}`);
        const product = await Product.create({
            title : req.body.title,
            description : req.body.description,
            price : req.body.price,
            small : req.body.small,
            medium : req.body.medium,
            large : req.body.large,
            extraLarge : req.body.extraLarge,
            doubleExtraLarge : req.body.doubleExtraLarge,
            size : req.body.size,
            fit : req.body.fit,
            specifications : req.body.specifications,
            washCare : req.body.washCare,
            mainImage : filePaths[0],
            backImage : filePaths[1],
            moreImages : [...filePaths.slice(2)]
        })
        return res.status(201).json({
            message : "product created",
            productID : product._id
        });
    }
    catch(err){
        next(err);
    }
}
exports.editProduct = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            console.log(err.array());
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const product = await Product.findById(req.body.productId);
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.small = req.body.small;
        product.medium = req.body.medium;
        product.large = req.body.large;
        product.extraLarge = req.body.extraLarge;
        product.doubleExtraLarge = req.body.doubleExtraLarge;
        product.size = req.body.size;
        product.fit = req.body.fit;
        product.washCare = req.body.washCare;
        product.specifications = req.body.specifications;
        await product.save();
        return res.status(200).json({
            message : "Product updated successfully",
            product : product
        });
    }
    catch(err){
        next(err);
    }
}
exports.getOrders = async (req ,res , next) => {
    try{
        const orders = await Order.find().select('-_id');
        return res.status(200).json(orders);
    }
    catch(err){
        next(err);
    }
}
exports.completeOrder = async (req ,res , next) => {
    try{
        const orderID = req.body.orderID;
        await Order.findOneAndUpdate({orderID : orderID , completed : false} , {
            $set : {
                completed : true
            }
        }, {new : false});
        return res.status(204).json();
    }
    catch(err){
        next(err);
    }
}
exports.toggleVisibility = async (req , res , next) => {
    try{
        const productID = req.params.productID;
        await Product.updateOne(
            { _id: productID },
            [{ $set: { visible: { $not: "$visible" } } }] 
        );
        return res.status(204).json();
    }
    catch(err){
        next(err);
    }
}

const Product = require("../models/product");
const {validationResult ,matchedData} = require("express-validator");
const Order = require("../models/order");
const User = require('../models/user');
const mongoose = require("mongoose");
const ExchangeTickets = require('../models/ExchangeTicket');
const {deleteFilesFromS3} = require("../utils/multerSetup")
const fs = require('fs');
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
    let filePaths = req.files.map(file => file.location);
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
            gender : req.body.gender,
            specifications : req.body.specifications,
            washCare : req.body.washCare,
            mainImage : filePaths[0],
            backImage : filePaths[1],
            moreImages : filePaths.slice(2)
        })
        return res.status(201).json({
            message : "product created",
            productID : product._id
        });
    }
    catch(err){
        await deleteFilesFromS3(filePaths);
        next(err);
    }
}
exports.editProduct = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
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
        product.gender = req.body.gender;
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
exports.updateOrderStatus = async (req ,res , next) => {
    try{
        const orderID = req.body.orderID;

        const order = await Order.findOne({ orderID: orderID });

        if (!order || order.status === 2 || order.cancelled) {
            return res.status(404).json({ message: "cannot update the status of given order" });
        }

        // Prepare the update object
        let updateFields = { $inc: { status: 1 } };

        // Set the deliveryDate if the current status is 1 (transitioning from 1 to 2)
        if (order.status === 1) {
            updateFields.$set = { deliveryDate: new Date() };
        }

        // Update the order
        await Order.findOneAndUpdate(
            { orderID: orderID },
            updateFields,
            { new : false} 
        );

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

exports.getExchangeTickets = async (req , res , next) => {
    try{
        const exchangeTickets = await ExchangeTickets.find();
        return res.status(200).json(exchangeTickets); 
    }
    catch(err){
        next(err);
    }
}
exports.getUserData = async (req , res , next) => {
    try{
        const data = await User.find().select('email phone');

        // Prepare CSV output
        let csvOutput = 'Email,Phone\n'; // CSV header

        // Loop through the data to format emails and phone numbers
        data.forEach(user => {
            const email = user.email ? user.email : ''; // Use empty string if no email
            const phone = user.phone ? user.phone : ''; // Use empty string if no phone
            csvOutput += `${email},${phone}\n`; // Append each entry
        });

        // Save the output to a CSV file
        fs.writeFileSync('user_data.csv', csvOutput, 'utf8');

        // Send a success response
        return res.status(200).json({ message: 'Data saved to user_data.csv successfully!' });
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

exports.toggleTopProduct = async (req , res , next) => {
    try{
        const productID = req.params.productID;
        await Product.updateOne(
            { _id: productID },
            [{ $set: { top: { $not: "$top" } } }] 
        );
        return res.status(204).json();
    }
    catch(err){
        next(err);
    }
}
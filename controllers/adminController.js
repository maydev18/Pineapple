const Product = require("../models/product");
const {validationResult ,matchedData} = require("express-validator");
const Order = require("../models/order");

exports.addProduct = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            console.log(err.array());
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        if (!req.files) {
            return res.status(400).json({
                message : "No file uploaded",
                product_added : false
            })
        }
        const filePaths = req.files.map(file => `${process.env.BASE_URL}/${file.filename}`);
        const data = matchedData(req);
        const product = await Product.create({
            title : data.title,
            description : data.description,
            price : data.price,
            small : data.small,
            medium : data.medium,
            large : data.large,
            extraLarge : data.extraLarge,
            doubleExtraLarge : data.doubleExtraLarge,
            mainImage : filePaths[0],
            moreImages : [...filePaths.slice(1)],
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
        const data = matchedData(req);
        product.title = data.title;
        product.description = data.description;
        product.price = data.price;
        product.small = data.small;
        product.medium = data.medium;
        product.large = data.large;
        product.extraLarge = data.extraLarge;
        product.doubleExtraLarge = data.doubleExtraLarge;
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
        await Order.findOneAndUpdate({orderID : orderID} , {
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

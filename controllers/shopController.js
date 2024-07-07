const Product = require("../models/product");
const User = require("../models/user");
const ITEMS_PER_PAGE = 10;
const Address = require("../models/address");
const {matchedData, validationResult} = require("express-validator");
const address = require("../models/address");
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
        const product = await Product.findById(req.params.productID);
        if(!product){
            return res.status(404).json({
                message : "Product not found with the given ID"
            })
        }
        return res.status(200).json({
            product : product
        })
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
        return res.status(200).json(cart);
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

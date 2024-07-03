const Product = require("../models/product");
const {validationResult ,matchedData} = require("express-validator")


exports.addProduct = (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            console.log(error);
            throw error;
        }
        const data = matchedData(req);
        return res.status(200).json(data);
    }
    catch(err){
        next(err);
    }
   
}
const User = require("../models/user");
const {validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");

exports.authenticate = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const email = req.body.email;
        let user = await User.findOne({email : email});
        if(!user){
            user = await User.create({
                email : req.body.email,
                userName : req.body.name,
            })    
        }
        const token = jwt.sign({
            userID : user._id,
            admin : user.admin
        } , process.env.JWT_SECRET_KEY , {expiresIn : "30d"});
        return res.status(200).json({token : token , name : user.userName});
    }
    catch(err){
        next(err);
    }
}
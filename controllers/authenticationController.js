const User = require("../models/user");
const {validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");
const {sendSMS} = require("../utils/SNS");
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
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Ensures a 4-digit OTP
};
exports.loginWithMobileNumber = async(req , res , next) => {
    try{
        const phone = req.params.phone;
        if(phone.length !== 10){
            throw new Error("Please enter a valid phone number");
        }
        let user = await User.findOne({phone : phone});
        let otp = generateOTP();
        if(!user){
            user = await User.create({phone : phone});
        }
        user.otp = otp;
        await user.save();
        sendSMS(phone , otp);
        return res.status(200).json({"message" : "OTP sent successfully to " + phone});
    }
    catch(err){
        next(err);
    }
}
exports.verifyOTP = async (req , res , next) => {
    try{
        const {phone , otp} = req.params;
        const user = await User.findOne({phone : phone , otp : otp});
        if(!user){
            throw new Error("cannot verify the otp");
        }
        user.otp = undefined;
        user.save();
        const token = jwt.sign({
            userID : user._id,
            admin : user.admin
        } , process.env.JWT_SECRET_KEY , {expiresIn : "30d"});
        return res.status(202).json({token : token});
    }
    catch(err){
        next(err);
    }
}
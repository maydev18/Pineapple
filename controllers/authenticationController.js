const User = require("../models/user");
const {validationResult , matchedData} = require('express-validator');
const bcrypt = require("bcrypt");
const mail = require("../utils/sendEmail");
const verify = require("../utils/verify");
const jwt = require("jsonwebtoken");
exports.signup = async (req , res , next) => {
    try{
        //checking for validation errors
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            console.log(error);
            throw error;
        }
        //creating a new user
        const requestData = matchedData(req);
        const hashedPassword = await bcrypt.hash(requestData.password , 12);
        const createdUser = await User.create({email : requestData.email , password : hashedPassword});
        console.log("A new user created with email " + createdUser.email);

        //generating a verification token
        const tokenUser = await verify.generateToken(createdUser);

        //sending the email to user
        await verify.sendVerificationEmail(tokenUser);

        //sending the response
        res.status(201).json({
            message : "Account created, kindly open your gmail account and click on the verification link in order to login",
            email : createdUser.email,
            verified : false,
        })
    }
    catch(err){
        next(err);
    }
}
exports.verifyAccount = async (req , res , next) => {
    try{
        const token = req.params.token;
        const user = await User.findOne({token : token , tokenExpirationTime : {
            $gte : new Date().toISOString()
        } , verified : false})
        if(!user){
            const error = new Error("token cannot be verified or the account is already verified");
            error.statusCode = 403;
            throw error;
        }
        //making the user verified
        user.verified = true;
        const savedUser = await user.save()

        //sending a welcome email
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Welcome user',
            html : `${require("../emails/welcome").welcome}`
        };
        await mail.mail(mailOptions);
        res.status(200).json({
            message : "User verified successfully",
            email : savedUser.email,
            verified : true
        });
    }
    catch(err){
        next(err);
    }
}
exports.login = async (req , res , next) => {
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
            const error = new Error(err.array()[0].msg);
            error.statusCode = 422;
            console.log(error);
            throw error;
        }
        const email = req.body.email;
        const password = req.body.password;
        const user =await User.findOne({email : email});

        if(!user){
            return res.status(404).json({
                message : "Account not found",
                loggedin : false
            })
        }
        if(!user.verified){
            //generating a verification token
            const tokenUser = await verify.generateToken(user);
            //sending the email to user
            await verify.sendVerificationEmail(tokenUser);
            //sending the response
            return res.status(401).json({
                message : "Please verify your account. Kindly check the email with a verification link",
                email : email,
                verified : false,
                loggedin : false
            })
        }
        const verified = await bcrypt.compare(password , user.password);
        if(!verified){
            return res.status(401).json({
                message : "Wrong password, please enter a correct password",
                loggedin : false
            })
        }
        const token = jwt.sign({
            email : email,
            admin : user.admin
        } , process.env.JWT_SECRET_KEY , {expiresIn : "30d"});
        return res.status(200).json({token : token , email : user.email , loggedin : true});
    }
    catch(err){
        next(err);
    }
}
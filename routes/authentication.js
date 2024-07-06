const express = require('express');
const {body} = require('express-validator');
const router = express.Router();
const authentication_controller = require("../controllers/authenticationController");
const User = require('../models/user');


router.put("/signup" ,[
    body('email').trim().escape().normalizeEmail().isEmail().withMessage("Please enter a valid email").custom(async value => {
        const user = await User.findOne({email : value});
        if(user){
            const err = new Error("Email already in use");
            err.statusCode = 409;
            throw err;
        }
    }),
    body('password').trim().escape().isLength({min:6 , max:500}).withMessage("Please enter a password atleast 6 characters long")
] , authentication_controller.signup);


//dummy get request handler
router.get("/verify/:token" , authentication_controller.verifyAccount);

router.post("/login" , [
    body('email').trim().escape().normalizeEmail().isEmail().withMessage("Please enter a valid email"),
    body('password').trim().escape()
] , authentication_controller.login);

router.post("/forget-password" , [
    body('email').trim().escape().normalizeEmail().isEmail().withMessage("Please enter a valid email").custom(async value => {
        const user = await User.findOne({email : value});
        if(!user){
            const err = new Error("Account does not exist");
            err.statusCode = 404;
            throw err;
        }
    }),
], authentication_controller.postForgetPassword);
router.get("/forget-password/:token" , authentication_controller.verifyForgetPasswordToken);
router.post("/update-password" , [body('password').trim().escape().isLength({min:6 , max:500}).withMessage("Please enter a password atleast 6 characters long")] , authentication_controller.setNewPassword)
module.exports = router;
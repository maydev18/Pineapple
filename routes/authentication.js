const express = require('express');
const {body} = require('express-validator');
const router = express.Router();
const authentication_controller = require("../controllers/authenticationController");

router.post("/authenticate" , [
    body('email').trim().escape().normalizeEmail().isEmail().withMessage("Please enter a valid email"),
    body('email_verified').custom(val => {
        if(!val){
            throw new Error("please enter a verified email");
        }
        return true;
    })
] , authentication_controller.authenticate);

router.get("/login-with-phone/:phone" , authentication_controller.loginWithMobileNumber);
router.get("/verify-otp/:phone/:otp" , authentication_controller.verifyOTP);
module.exports = router;
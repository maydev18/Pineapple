const { ConnectionStates } = require("mongoose");
const User = require("../models/user");
const mail = require("./sendEmail");
const crypto = require('crypto');
exports.generateToken  = async (user) => {
    try{
        const buffer = crypto.randomBytes(32);
        const token = buffer.toString('hex');
        user.token = token;
        user.tokenExpirationTime = Date.now() + 3600000; //Token validity is for one hour
        return user.save();
    }
    catch(err){
        throw err;
    }
}

exports.sendVerificationEmail = async (user) => {
    url = process.env.BASE_URL + "/verify/" + user.token;
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Verify Your Account',
        html : `
            <p>Please click <a href = ${url}>here</a> to verify your email </p>
        `
    };
    mail.mail(mailOptions);
}
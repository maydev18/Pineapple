const User = require("../models/user");

exports.signup = (req , res , next) => {
    const email = req.body.email;
    const pass = req.body.password;
    console.log(email , pass);
    res.status(200).json({message : "Testing done"});
}
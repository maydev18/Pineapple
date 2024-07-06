const jwt = require("jsonwebtoken");

module.exports = (req , res , next)=>{
    try{
        const authHeader = req.get("Authorization");
        if(!authHeader){
            const error = new Error("Authorization header absent, please use authorization header in order to continue");
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET_KEY);
        if(!decodedToken){
            return res.status(401).json({
                message : "login failed, please login again, token is invalid",
                loggedin : false
            })
        }
        req.userEmail = decodedToken.email;
        req.admin = decodedToken.admin;
        next();
    }
    catch(err){
        next(err);
    }
}
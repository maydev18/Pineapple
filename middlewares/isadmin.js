module.exports = (req , res , next)=>{
    if(!req.admin){
        const err = new Error("Admin permissions are required to perform such action");
        err.statusCode = 405;
        throw err;
    }
    next();
}
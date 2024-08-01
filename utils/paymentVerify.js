const crypto = require('crypto');
exports.validatePayment = async (paymentID , orderID , signature) => {
    const sha = crypto.createHmac("sha256" , process.env.PAYMENT_SECRET);
    sha.update(`${orderID}|${paymentID}`);
    const digest = sha.digest("hex");
    if(digest !== signature){
        return false;
    }
    else{
        return true
    }
}
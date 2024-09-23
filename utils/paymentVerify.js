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
exports.getTotalCartValue = async(cart) => {
    let totalQuantity = 0;
    for(cartItems of cart){
        totalQuantity += cartItems.quantity;
    }
    const pricedQuantity = totalQuantity - Math.floor(totalQuantity/2);
    return pricedQuantity * 500 - 1;
}
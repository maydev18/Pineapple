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
exports.getTotalCartValue = (cart) => {
    let totalAmount = 0;
    let payableAmount = 0;
    let totalQuantity = 0;
    for(cartItems of cart){
        totalAmount += cartItems.quantity * cartItems.productID.price;
        totalQuantity += cartItems.quantity;
    }
    payableAmount = totalAmount;
    if(totalAmount >= 600){
        payableAmount = payableAmount - ((process.env.DISCOUNT/100) * totalAmount);
    }
    return {
        total : totalAmount,
        payable : Math.round(payableAmount),
        totalCartItems : Math.round(totalQuantity),
        discount : Math.round(totalAmount - payableAmount)
    };
}
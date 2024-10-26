const mongoose = require("mongoose");
const Product = require("./product");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email : {
        type : String,
    },
    phone : {
        type : String,
    },
    otp : {
        type : String
    },
    cart : [
        {
            _id : false,
            productID : {
                type : Schema.Types.ObjectId,
                required : true,
                ref : 'Product'
            },
            quantity : {
                type : Number,
                required : true, 
            },
            size : {
                type : String,
                required : true
            }
        }
    ],
    addresses : [
        {
            _id : false,
            addressID : {
                type : Schema.Types.ObjectId,
                required : true,
                ref : 'Address'
            }
        }
    ],
    admin : {
        type : Boolean,
        default : false
    }
});

UserSchema.methods.addToCart = async function (productID , size) {
    const cartProductIndex = this.cart.findIndex(cartProduct => {
        return (cartProduct.productID.toString() === productID.toString()) && (cartProduct.size.toString() === size.toString());
    });
    let newQuantity = 1;
    const updatedCart = [...this.cart];
    const product = await Product.findById(productID);
    if (cartProductIndex >= 0) {
        if(this.cart[cartProductIndex].quantity + 1 > product[size]){
            throw new Error("Required Quantity is out of stock");
        }
        newQuantity = this.cart[cartProductIndex].quantity + 1;
        updatedCart[cartProductIndex].quantity = newQuantity;
    }
    else {
        if(product[size] == 0){
            throw new Error("Required Quantity is out of stock");
        }
        updatedCart.push({ productID: productID, quantity: 1 , size : size});
    }

    this.cart = updatedCart;
    return this.save();
}

UserSchema.methods.deleteFromCart = function(productID , size){
    const cartProductIndex = this.cart.findIndex(cartProduct => {
        return (cartProduct.productID.toString() === productID.toString()) && (cartProduct.size.toString() === size.toString());
    });
    if(this.cart[cartProductIndex].quantity === 1){
        const updatedCart = this.cart.filter(item => {
            return (item.productID.toString() !== productID.toString()) || (item.size.toString() !== size.toString());
        })
        this.cart = updatedCart;
    }
    else{
        this.cart[cartProductIndex].quantity--;
    }
    return this.save();
}
module.exports = mongoose.model("User" , UserSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    userID : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    address : {
        type : Object,
        required : true
    },
    products : [],
    time : {
        type : Date,
        required : true,
        default : new Date()
    },
    completed : {
        type : Boolean,
        required : true,
        default : false
    },
    paymentID : {
        type : String,
        required : true
    },
    orderID : {
        type : String,
        required : true
    },
});

module.exports = mongoose.model("Order" , OrderSchema);
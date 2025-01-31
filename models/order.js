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
        default : () => new Date()
    },
    //status 0 = order is placed, 1 = order is shipped , 2 = order is delivered
    status : {
        type : Number,
        required : true,
        default : 0
    },
    paymentID : {
        type : String,
        required : true
    },
    orderID : {
        type : String,
        required : true
    },
    method : {
        type : String,
        required : true
    },
    shipRocketOrderID : {
        type : String
    },
    shipmentID : {
        type : String
    },
    awb_code : {
        type : String
    },
    exchanged : {
        type : Boolean,
        default : false,
        required : true
    },
    deliveryDate : {
        type : Date
    },
    total : {
        type : Number
    },
    cancelled : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model("Order" , OrderSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Here the size is encoded as small(0) , medium(1) , large(2) , XL(3) , XXL(4)

const UserSchema = new Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : Number
    },
    verified : {
        type : Boolean,
        default : false,
        required : true
    },
    cart : [
        {
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
                type : Number,
                required : true
            }
        }
    ],
    addresses : [
        {
            addressID : {
                type : Schema.Types.ObjectId,
                required : true,
                ref : 'Address'
            }
        }
    ] 
});

module.exports = mongoose.model("User" , UserSchema);
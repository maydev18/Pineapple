const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    userID : {
        type : String,
        required : true
    },
    firstLine : {
        type : String,
        required : true
    },
    secondLine : {
        type : String
    },
    fullName : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    pincode : {
        type : String,
        required : true
    },
    landmark : {
        type : String,
    },
    state : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model("Address" , addressSchema);
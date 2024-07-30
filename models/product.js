const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    top : {
        type : Boolean,
        required : true,
        default : false
    },
    mainImage : {
        type : String,
        required : true
    },
    backImage : {
        type : String,
        required : true
    },
    moreImages : [],
    fit : {String},
    size : {String},
    washCare : {String},
    specifications : {String},
    small : {
        type : Number,
        default : 0
    },
    medium : {
        type : Number,
        default : 0
    },
    large : {
        type : Number,
        default : 0
    },
    extraLarge : {
        type : Number,
        default : 0
    },
    doubleExtraLarge : {
        type : Number,
        default : 0
    }
});

module.exports = mongoose.model("Product" , ProductSchema);
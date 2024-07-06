const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Here the size is encoded as small(0) , medium(1) , large(2) , XL(3) , XXL(4)

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
    mainImage : {
        type : String,
        required : true
    },
    moreImages : [],
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
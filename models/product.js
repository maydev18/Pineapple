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
    fit : {type : String},
    size : {type : String},
    washCare : {type : String},
    specifications : {type : String},
    reviews : [
        {
            _id : false,
            stars : {
                type : Number,
                required : true
            },
            content : {
                type : String,
                required : true
            },
            date : {
                type : Date,
                required : true,
                default : () => new Date()
            },
            buyer : {
                type : String,
                required : true
            }
        }
    ],
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
    },
    visible : {
        type : Boolean,
        required : true,
        default : false
    },
    gender : {
        type : String,
    }
});

module.exports = mongoose.model("Product" , ProductSchema);
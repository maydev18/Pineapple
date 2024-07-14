const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
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
        default : new Date()
    },
    userID : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    productID : {
        type : Schema.Types.ObjectId,
        ref : 'Product',
        required : true
    },
});

module.exports = mongoose.model('Review' , reviewSchema);

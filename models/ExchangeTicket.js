const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exchangeTicketSchema = new Schema({
    userID : {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    },
    orderID : {
        type : String,
        ref : 'Order',
        required : true,
        unique : true
    },
    time : {
        type : Date,
        required : true,
        default : new Date()
    },
    exchangeProducts : [
        {   
            exchangeReason : {
                type : Array,
                required : true,
                validate: {
                    validator: function(value) {
                        return value.length > 0;
                    },
                    message: "At least one exchange reason must be provided for each product."
                }
            },
            description : {
                type : String
            },
            product : {
                type : Object,
                required : true
            }
        }
    ]
});

// Custom validation to check if exchangeProducts array is not empty
exchangeTicketSchema.path('exchangeProducts').validate({
    validator: function(value) {
        // Ensure that the exchangeProducts array is not empty
        return value.length > 0;
    },
    message: "There must be atleast one product for exchange request."
});

module.exports = mongoose.model("ExchangeTicket" , exchangeTicketSchema);
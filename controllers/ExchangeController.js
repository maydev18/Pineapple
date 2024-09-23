const ExchangeTicket = require('../models/ExchangeTicket');
const Order = require('../models/order');
const mongoose = require("mongoose");
exports.addExchangeRequest = async (req , res , next) => {
    try{
        const userID = req.userID;
        const orderID = req.body.orderID;
        const exchangeProducts = req.body.exchangeProducts;
        const order = await Order.findOne({orderID : orderID});
        //exchange only possible if delivery date is not more than 4 days or above
        const days = (Date.now() - order.deliveryDate) / (1000 * 60 * 60 * 24);

        if(!order || order.completed === false || order.exchanged || days >= 4){
            throw new Error('Cannot create an exchange ticket for this order');
        }
        const exchangeTicket = await ExchangeTicket.create({
            userID : new mongoose.Types.ObjectId(userID),
            orderID : orderID,
            exchangeProducts : exchangeProducts
        });
        order.exchanged = true;
        await order.save();
        return res.status(202).json({
            message : "Exchange request created successfully",
        });
    }
    catch(err){
        next(err);
    }
}
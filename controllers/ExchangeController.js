const ExchangeTicket = require('../models/ExchangeTicket');
const Order = require('../models/order');
const mongoose = require("mongoose");
exports.addExchangeRequest = async (req , res , next) => {
    try{
        const userID = req.userID;
        const orderID = req.body.orderID;
        const exchangeProducts = req.body.exchangeProducts;
        const order = await Order.findOne({orderID : orderID}).select('time exchanged');
        if(!order){
            throw new Error('order doesnot exists');
        }
        if(order.exchanged){
            return res.status(400).json({message : "Cannot create another exchange request for the same order"});
        }
        const days = (Date.now() - order.time) / (1000 * 60 * 60 * 24);
        if(days >= 4){
            return res.status(401).json({message : "You can not place an exchange request after 4 days"});
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
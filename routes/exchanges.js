const express = require('express');
const {body} = require('express-validator');
const router = express.Router();
const isauth = require("../middlewares/isauth");
const exchangeController = require("../controllers/ExchangeController");
router.post('/create-exchange-ticket' , isauth , exchangeController.addExchangeRequest);
module.exports = router;
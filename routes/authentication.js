const express = require('express');

const router = express.Router();
const authentication_controller = require("../controllers/authenticationController");

router.put("/signup" , authentication_controller.signup);


module.exports = router;
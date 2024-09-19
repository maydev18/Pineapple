const express = require("express");
const app = express();
const mongoose = require('mongoose');

const cors = require("cors");
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
}));
app.use(require('body-parser').json());

require("dotenv").config();

app.use(require("./routes/shop"));
app.use('/auth' , require("./routes/authentication"));
app.use('/admin' , require("./routes/admin"));
app.use('/exchanges' , require('./routes/exchanges'));
app.use(express.static("./images"));
app.use((error , req , res , next) => {
    console.log(error);
    let status;
    if(!error.statusCode){
        status = 500;
    }
    else status = error.statusCode;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message : message , data : data});
})


mongoose.connect(process.env.MONGODB_URI)
.then(res => {
    app.listen(process.env.PORT , (err) => {
        if(err){
            console.log("Failed to connect to server");
        }
        else console.log("Server running and database connected");
    })
})
.catch(err => {
    console.log("Failed to connect to database");
    console.log(err);
})

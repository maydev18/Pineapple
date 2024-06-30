const express = require("express");
const app = express();
const mongoose = require('mongoose');
app.use(require('body-parser').json());

require("dotenv").config();


app.use("/auth" , require("./routes/authentication"));

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

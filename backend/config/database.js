const mongoose = require('mongoose');
const dotenv = require('dotenv');
require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("Database connected successfully");
    })
    .catch((err)=>{
        console.log("Database connection failed", err);
        process.exit(1);
    });

}

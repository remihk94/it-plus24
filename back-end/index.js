const express = require("express");
const mongoose = require ("mongoose");
const bodyParser = require('body-parser'); 
const app = express();
const pinRouter = require("./routes/pins");

require('dotenv').config();


mongoose.connect('mongodb://localhost/locations_db').then(()=>{
    console.log("mongodb connected");
}).catch((err)=>console.log(err));

app.use(bodyParser.json());
app.use("/", pinRouter)


app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
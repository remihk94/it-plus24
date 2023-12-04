const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  lat: {
    type: Number,
     
  },
  long: {
    type: String,
   
  },
  email: {
    type: String,
   
    max:50
  },
} ,
{timestamps:true}
);

const Pin = mongoose.model('Pin', pinSchema);

module.exports = Pin;
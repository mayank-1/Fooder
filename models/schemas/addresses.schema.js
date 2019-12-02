const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  pincode: {
    type: Number,
    required: true
  }
});

const Address = mongoose.model("Addresses", addressSchema);

module.exports = Address;
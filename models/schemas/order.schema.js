const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create order schema
const userAddressSchema = new Schema({
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
const orderSchema = new Schema({
  customerID: String,
  orderItems: Array,
  orderItemPrices: Array,
  orderTotalPrice: Number,
  deliveryAddress: [userAddressSchema],
  deliveryPerson: String,
  paymentMethod: String,
  trackingId: Number,
  transactionId: String
});
const Order = mongoose.model("Orders", orderSchema);
module.exports = Order;

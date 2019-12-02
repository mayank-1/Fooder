const Order = {};

//Restaurant Schema
const OrderSchema = require("./schemas/order.schema");
const OrdSchema = require("./schemas/order.schema").schema;

// mongoose
const mongoose = require("mongoose");

//Create new Restaurant
Order.create = async function(orderData, callback) {
  //Delivery Address
  var deliverToAddress = {
    addressLine1: orderData.formData.addrLine1,
    addressLine2: orderData.formData.addrLine2,
    city: orderData.formData.cityName,
    pincode: orderData.formData.pinCode
  };

  // Get only item names
  var dishList = [];
  for (var i = 0; i < orderData.formData.itemName.length - 1; i++) {
    var dishName = orderData.formData.itemName[i].split("-")[0];
    dishList.push(dishName);
  }

  // get price list
  var ordData = orderData.formData.itemName;
  var totalPrice = ordData[ordData.length - 1];

  //Order Details
  var newOrder = {
    customerID: orderData.userID,
    deliveryAddress: [deliverToAddress],
    orderItems: dishList,
    orderItemPrices: orderData.formData.itemCost,
    orderTotalPrice: totalPrice
  };

  const order = new OrderSchema(newOrder);
  order
    .save()
    .then(function(data) {
      if (data) {
        callback(null, data);
      } else {
        callback("Failed To Save");
      }
    })
    .catch(function(err) {
      callback(err);
    });
};

//Get all the orders For a User
Order.getOrders = async function(user_ID, callback) {
  OrderSchema.find({ customerID: user_ID }, function(err, data) {
    return callback(err, data);
  });
};

module.exports = Order;

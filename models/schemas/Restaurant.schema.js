const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const restaurantAddressSchema = new Schema({
  street: {
    type: String
  },
  area: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: Number
  },
  country: {
    type: String
  }
});

const restaurantSchema = new Schema({
  restaurantName: {
    type: String
  },
  restaurantOwnerID: {
    type: String
  },
  foodCatergory: {
    type: String
  },
  restaurantImageURL: {
    type: String
  },
  cuisine: {
    type: String
  },
  address: [restaurantAddressSchema],
  keywords: {
    type: String
  },
  priceBracket: {
    type: String
  }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;

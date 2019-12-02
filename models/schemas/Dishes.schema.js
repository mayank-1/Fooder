const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dishesSchema = new Schema({
  restaurantId: {
    type: String
  },
  ownerID: {
    type: String
  },
  dishName: {
    type: String
  },
  dishDescription: {
    type: String
  },
  pricePerUnit: {
    type: Number
  },
  discount: {
    type: Number
  },
  foodType: {
    type: String
  }
});

const Dishes = mongoose.model("Dishes", dishesSchema);

module.exports = Dishes;

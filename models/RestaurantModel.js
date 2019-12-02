const Restaurant = {};

//Restaurant Schema
const RestaurantSchema = require("./schemas/Restaurant.schema");
const ResSchema = require("./schemas/Restaurant.schema").schema;

//Dishes Schema
const createDisheSchema = require("./schemas/Dishes.schema");
const DishSchema = require("./schemas/Dishes.schema").schema;
const MenuListSchema = require("./schemas/Dishes.schema").schema;

const mongoose = require("mongoose");

//Create new Restaurant
Restaurant.create = async function(restData, callback) {
  //Address
  var address = {
    street: restData.formData.restaurantStreet,
    area: restData.formData.restaurantArea.toLowerCase(),
    city: restData.formData.restaurantCity,
    state: restData.formData.restaurantState,
    pincode: restData.formData.restaurantPincode,
    country: restData.formData.restaurantCountry
  };

  //Restaurant Details
  var newRestaurant = {
    restaurantName: restData.formData.restaurantName,
    restaurantOwnerID: restData.restOwnerIDValue,
    foodCatergory: restData.formData.restaurantFoodCategory,
    restaurantImageURL: restData.imgURL,
    cuisine: restData.formData.restaurantCuisine,
    address: [address],
    keywords: restData.formData.restaurantKeywords,
    priceBracket: restData.formData.restaurantPriceBracket
  };

  const restaurant = new RestaurantSchema(newRestaurant);
  restaurant
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

//Get all the Restaurants For a Owner
Restaurant.getRestaurant = function(owner_ID, callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);

  //Search all the Restaurant with Owner_id
  restaurant.find({ restaurantOwnerID: owner_ID }, function(err, success) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};

//Get all the Restaurants
Restaurant.getAllRestaurant = function(callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  //Find all the restaurants
  restaurant.find({}, function(err, success) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};

Restaurant.getAllRestaurantByName = function(callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  //Find all the restaurants
  restaurant.find({}, function(err, success) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};
//Get all the Restaurants For a Particular Area
Restaurant.getAllRestaurantByArea = function(area, callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  //Find all the restaurants
  restaurant.find({ "address.area": area.toLowerCase() }, function(
    err,
    success
  ) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};

// Get restaurant by restaurant ID
Restaurant.getRestaurantById = function(id, callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  // Find restaurant by id
  restaurant.find({ _id: mongoose.Types.ObjectId(id) }, function(err, success) {
    if (err) {
      callback(`Failed to find restaurant with ${id}`);
    } else {
      callback(null, success);
    }
  });
};

//Create Dish
Restaurant.createDish = function(dishData, callback) {
  var dishToSave = {
    restaurantId: dishData.dishForm.restaurantIdForDish,
    ownerID: dishData.ownerId,
    dishName: dishData.dishForm.dishNameForDish,
    dishDescription: dishData.dishForm.descriptionForDish,
    pricePerUnit: dishData.dishForm.pricePerUnitForDish,
    discount: dishData.dishForm.discountForDish,
    foodType: dishData.dishForm.foodTypeForDish
  };

  const dishCreation = new createDisheSchema(dishToSave);
  dishCreation
    .save()
    .then(function(success) {
      callback(null, success);
    })
    .catch(function(err) {
      callback(err);
    });
};

// Get menu list of restaurant by Id
Restaurant.getMenu = function(id, callback) {
  var dishList = mongoose.model("Dishes", MenuListSchema);
  dishList.find({}, function(err, success) {
    if (err) {
      callback(`Failed to find menu for restaurant id: ${id}`);
    } else {
      callback(null, success);
    }
  });
};
Restaurant.getAllRestaurants = function(callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  var dishes = mongoose.model("dishes", DishSchema);
  //Search all the Restaurant with Owner_id
  restaurant.find({}, function(err, success) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};

Restaurant.getAllDishes = function(callback) {
  var restaurant = mongoose.model("Restaurant", ResSchema);
  var dishes = mongoose.model("dishes", DishSchema);
  //Search all the Restaurant with Owner_id
  dishes.find({}, function(err, success) {
    if (!err) {
      callback(null, success);
    } else {
      callback("Failed, Try Again");
    }
  });
};

module.exports = Restaurant;

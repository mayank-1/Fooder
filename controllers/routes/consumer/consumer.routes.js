const express = require("express");
const async = require("async");
const routerConsumer = express.Router();
const bcryptJS = require("bcryptjs");

const authController = require("./../../auth/auth");

//Model
const restaurantModel = require("./../../../models/RestaurantModel");
const UserModel = require("./../../../models/UserModel");
// Order Model
const orderModel = require("./../../../models/OrderModel");

//Consumer Home Page
routerConsumer.get("/home", authController.redirectToLogin, function(req, res) {
  //Filters By Category
  var nearby = [];
  var vegRest = [];
  var nonVegRest = [];
  var cheapRest = [];

  var error = {};
  //Check if the Area value is available in session or not
  if (req.session.choosenArea && req.session.choosenArea !== "") {
    //Get all the restaurants for that specific area
    var area = req.session.choosenArea;
    restaurantModel.getAllRestaurantByArea(area, function(err, response) {
      if (!err) {
        if (response.length > 0) {
          //All Restaurants are Of same location so storing them in nearby array
          nearby = response;

          async.forEachOf(response, (restaurant, key) => {
            if (restaurant.foodCatergory === "nvg") {
              nonVegRest.push(restaurant);
              //Check for Cheap
              if (restaurant.priceBracket === "cheap") {
                cheapRest.push(restaurant);
              }
            } else if (restaurant.foodCatergory === "vg") {
              vegRest.push(restaurant);
              //Check for Cheap
              if (restaurant.priceBracket === "cheap") {
                cheapRest.push(restaurant);
              }
            } else if (restaurant.priceBracket === "cheap") {
              cheapRest.push(restaurant);
            }
          });

          return res.render("homepage", {
            pageTitle: "Home",
            user: req.session.user,
            nearbyOption: nearby,
            vegOption: vegRest,
            nonVegOption: nonVegRest,
            cheapPocket: cheapRest,
            userChoosenArea: req.session.choosenArea
          });
        } else {
          //No record Found For this Area
          return res.render("homepage", {
            pageTitle: "Home",
            user: req.session.user,
            nearbyOption: nearby,
            vegOption: vegRest,
            nonVegOption: nonVegRest,
            cheapPocket: cheapRest,
            userChoosenArea: req.session.choosenArea,
            errorContent: {
              errType: "danger",
              errHeader: "Restaurant Result",
              errTitle: "O Restaruants Found",
              errMsg: "Please Try Another Area By Entering it in the Navigation"
            }
          });
        }
      } else {
        return res.render("homepage", {
          pageTitle: "Home",
          user: req.session.user,
          nearbyOption: nearby,
          vegOption: vegRest,
          nonVegOption: nonVegRest,
          cheapPocket: cheapRest,
          userChoosenArea: req.session.choosenArea,
          errorContent: {
            errType: "danger",
            errHeader: "Server Error",
            errTitle: "Sorry, Server Down",
            errMsg:
              "Please Try Again after Sometime and Sorry for the inconvinience caused to you"
          }
        });
      }
    });
  } else {
    //Get all the restaurants
    //Fetch all restaurants
    restaurantModel.getAllRestaurant(function(err, response) {
      if (!err) {
        if (response.length > 0) {
          async.forEachOf(response, (restaurant, key) => {
            if (restaurant.foodCatergory === "nvg") {
              nonVegRest.push(restaurant);
              //Check for Cheap
              if (restaurant.priceBracket === "cheap") {
                cheapRest.push(restaurant);
              }
            } else if (restaurant.foodCatergory === "vg") {
              vegRest.push(restaurant);
              //Check for Cheap
              if (restaurant.priceBracket === "cheap") {
                cheapRest.push(restaurant);
              }
            } else if (restaurant.priceBracket === "cheap") {
              cheapRest.push(restaurant);
            }
          });
          return res.render("homepage", {
            pageTitle: "Home",
            user: req.session.user,
            nearbyOption: nearby,
            vegOption: vegRest,
            nonVegOption: nonVegRest,
            cheapPocket: cheapRest,
            userChoosenArea: req.session.choosenArea
          });
        } else {
          //No record Found For this Area
          return res.render("homepage", {
            pageTitle: "Home",
            user: req.session.user,
            nearbyOption: nearby,
            vegOption: vegRest,
            nonVegOption: nonVegRest,
            cheapPocket: cheapRest,
            userChoosenArea: req.session.choosenArea,
            errorContent: {
              errType: "danger",
              errHeader: "Restaurant Result",
              errTitle: "O Restaruants Found",
              errMsg: "Please Try Another Area By Entering it in the Navigation"
            }
          });
        }
      } else {
        return res.render("homepage", {
          pageTitle: "Home",
          user: req.session.user,
          nearbyOption: nearby,
          vegOption: vegRest,
          nonVegOption: nonVegRest,
          cheapPocket: cheapRest,
          userChoosenArea: req.session.choosenArea,
          errorContent: {
            errType: "danger",
            errHeader: "Server Error",
            errTitle: "Sorry, Server Down",
            errMsg:
              "Please Try Again after Sometime and Sorry for the inconvinience caused to you"
          }
        });
      }
    });
  }
});

//Get Area Details Given by User in Navbar
routerConsumer.post("/home", authController.redirectToLogin, function(
  req,
  res
) {
  //Get User Area Details
  var areaChoosenByUser = req.body.userArea;
  req.session.choosenArea = areaChoosenByUser;

  res.redirect("/consumer/home");
});

//Consumer Profile Page

routerConsumer.get("/profile", authController.redirectToLogin, function(
  req,
  res
) {
  orderModel.getOrders(req.session.user._id, function(err, orders) {
    if (!err) {
      UserModel.getAddresses(req.session.user, function(err, data) {
        if (!err) {
          return res.render("user-profile-page", {
            pageTitle: "Account",
            user: req.session.user,
            addresses: data,
            orders: orders
          });
        }
      });
    }
  });
});

//Consumer Help/Support Page
routerConsumer.get("/help", authController.redirectToLogin, function(req, res) {
  UserModel.getQueries(req.session.user, function(err, data) {
    return res.render("support", {
      pageTitle: "Help",
      user: req.session.user,
      issues: data
    });
  });
});

//Consumer Checkout Page
routerConsumer.post("/checkout", authController.redirectToLogin, function(
  req,
  res
) {
  var orderDetails = req.body;
  var cart = [];
  var cartLength = 0;
  if (typeof orderDetails.itemName === "object") {
    for (var i = 0; i < orderDetails.itemName.length; i++) {
      cart.push({
        dishName: orderDetails.itemName[i],
        dishPrice: orderDetails.itemCost[i]
      });
    }
  }

  if (typeof orderDetails.itemName === "string") {
    var dish = orderDetails.itemName.split("-")[0];
    cart.push({
      dishName: dish,
      dishPrice: orderDetails.itemCost
    });
  }
  //Cart Count
  cartLength = cart.length;

  //Save Cart Count in Session
  req.session.cartItemCount = cartLength;

  // Save cart item number to session
  req.session.cartItemNumber = cart.length;
  var data = { cart, amountPayable: orderDetails.amountToPay };

  return res.render("checkout", {
    pageTitle: "Checkout",
    user: req.session.user,
    data: data,
    cartCount: req.session.cartItemCount
  });
});

// Consumer Order Confirmation Page
routerConsumer.post(
  "/orderConfirmation",
  authController.redirectToLogin,
  async function(req, res) {
    var userID = req.session.user._id;
    var dataFromCheckout = {
      userID: userID,
      formData: req.body
    };

    // Access model to create new order in db
    orderModel.create(dataFromCheckout, function(err, result) {
      if (!err) {
        return res.render("order-confirmation", {
          pageTitle: "Order Confirmed",
          user: req.session.user,
          data: dataFromCheckout,
          orderFromRes: req.session.resOrderedFrom
        });
      }
      if (err) {
        res.send("/consumer/orderConfirmation", {
          alertType: "danger",
          alertMsgStrong: "Sorry!",
          alertMsg: "Something went wrong",
          goBackMsg: "Please Try Again"
        });
      }
    });
  }
);

//Consumer Offers Page
routerConsumer.get("/offers", authController.redirectToLogin, function(
  req,
  res
) {
  var restaurants = null;
  var dishes = null;
  var array = [];
  // Fetching all restaurants
  restaurantModel.getAllRestaurants(function(error, data) {
    restaurants = data;
  });

  // fetching all dishes
  restaurantModel.getAllDishes(function(error, data) {
    dishes = data;

    // Handling Error if any
    if (!restaurants || !dishes) {
      return res.redirect("offers");
    }
    // Matching dishes with respective restaurants
    else {
      for (var i = 0; i < restaurants.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          // Check if restaurant already exits in array
          if (
            !array.some(
              array => array.restaurantName === restaurants[i].restaurantName
            )
          )
            if (dishes[j].restaurantId == restaurants[i]._id)
              array.push({
                restaurantId: restaurants[i]._id,
                restaurantName: restaurants[i].restaurantName,
                cuisine: restaurants[i].cuisine,
                restaurantImageURL: restaurants[i].restaurantImageURL,
                foodCategory: restaurants[i].foodCatergory,
                dish: dishes[j].dishName,
                dishDescription: dishes[j].dishDescription,
                pricePerUnit: dishes[j].pricePerUnit,
                discount: dishes[j].discount,
                foodType: dishes[j].foodType
              });
        }
      }
      // Rendering Data to the page
      return res.render("offers", {
        pageTitle: "Offers",
        user: req.session.user,
        data: array
      });
    }
  });
});

//Consumer search Page
routerConsumer.get("/search", authController.redirectToLogin, function(
  req,
  res
) {
  return res.render("search", {
    pageTitle: "Search",
    user: req.session.user,
    message: "Need it ? Search it ! Grab it !"
  });
});

// Consumer search page
routerConsumer.post("/search", authController.redirectToLogin, function(
  req,
  res
) {
  var restaurants = null;
  var dishes = null;

  // Fetching all restaurants
  restaurantModel.getAllRestaurants(function(error, data) {
    restaurants = data;
    restaurantModel.getAllDishes(function(error, data) {
      dishes = data;
      var array = [];
      var query = req.body.query;
      query = query.trim();
      // Handling Error if any
      if (!restaurants || !dishes) {
        return res.render("search", {
          pageTitle: "Search",
          message: "Try Again :("
        });
      } else {
        // Filter restaurants with querys
        var filterdRestaurants = restaurants.filter(data =>
          data.restaurantName.toLowerCase().includes(query.toLowerCase())
        );

        // Collection dishes to relevant restaurants
        for (var i = 0; i < restaurants.length; i++) {
          // dishes with same restaurants
          var result = dishes.filter(
            data => data.restaurantId == restaurants[i]._id
          );
          // Adding dishes to restaurant object
          array.push({
            _id: restaurants[i]._id,
            restaurantName: restaurants[i].restaurantName,
            cuisine: restaurants[i].cuisine,
            restaurantImageURL: restaurants[i].restaurantImageURL,
            foodCategory: restaurants[i].foodCatergory,
            dishes: result
          });
        }

        // filter data stored in array with query
        var filterdRestaurantsWithDishes = array.filter(data =>
          data.restaurantName.toLowerCase().includes(query.toLowerCase())
        );

        if (filterdRestaurants.length == 0) {
          return res.render("search", {
            pageTitle: "Search",
            user: req.session.user,
            morerestaurants: restaurants,
            noResult: " :( No restaurant found ! Try another restaurant ",
            messagetab2: "You may like this "
          });
        }

        return res.render("search", {
          pageTitle: "Search",
          user: req.session.user,
          restaurantsfound: filterdRestaurants,
          morerestaurants: restaurants,
          dishes: filterdRestaurantsWithDishes,
          messagetab1: "Results found",
          messagetab2: "See More"
        });
      }
    });
  });
});

//Consumer all restaurants page display
routerConsumer.get("/allrestaurants", authController.redirectToLogin, function(
  req,
  res
) {
  var restaurants = null;
  restaurantModel.getAllRestaurant(function(error, data) {
    restaurants = data;
    if (!error) {
      if (restaurants.length > 0) {
        return res.render("filter-restaurant", {
          pageTitle: "All Restaurants",
          user: req.session.user,
          displayRestaurant: data
        });
      } else {
        //renders if no restaurant found
        return res.render("filter-restaurant", {
          pageTitle: "All Restaurants",
          user: req.session.user,
          noDataFoundError: {
            errHeader: "No Restaurant Found",
            errTitle: "OOPS!",
            errMsg:
              "we couldn't find what you are looking for, mind trying something else?"
          }
        });
      }
    } else {
      //renders if no restaurant found in database
      return res.render("filter-restaurant", {
        pageTitle: "All Restaurants",
        user: req.session.user,
        noDataFoundError: {
          errHeader: "No Restaurant Found",
          errTitle: "OOPS!",
          errMsg:
            "we couldn't find what you are looking for, mind trying something else?"
        }
      });
    }
  });
});

//Consumer Restaurant Page
routerConsumer.get(
  "/restaurant/?:res_id",
  authController.redirectToLogin,
  function(req, res) {
    var restaurantId = req.params.res_id;
    var resMenu = [];

    ///////////////////// Restaurant Menu //////////////////////////////
    restaurantModel.getMenu(restaurantId, function(err, response) {
      if (!err) {
        async.forEachOf(response, restaurant => {
          if (restaurant.restaurantId === restaurantId) {
            resMenu.push(restaurant);
          }
        });

        ///////////////////// Restaurant by Id //////////////////////////
        restaurantModel.getRestaurantById(restaurantId, function(
          err,
          response
        ) {
          if (!err) {
            var resData = response[0];
            var userVisitedRes = resData.restaurantName;
            req.session.resOrderedFrom = userVisitedRes;
            var fullAddress =
              resData.address[0].street +
              ", " +
              resData.address[0].area +
              ", " +
              resData.address[0].city +
              ", " +
              resData.address[0].state +
              ", " +
              resData.address[0].country;
            return res.render("restaurant", {
              userChoosenArea: req.session.choosenArea,
              pageTitle: resData.restaurantName,
              user: req.session.user,
              resImgUrl: resData.restaurantImageURL,
              resName: resData.restaurantName,
              resCuisine: resData.cuisine,
              resPrice: resData.priceBracket,
              restMenu: resMenu,
              cartCount: req.session.cartItemCount,
              restAddress: fullAddress
            });
          }
        });
      }
    });
  }
);

// Consumer all restaurants page for search
routerConsumer.post("/allrestaurants", authController.redirectToLogin, function(
  req,
  res
) {
  var restaurants = null;
  restaurantModel.getAllRestaurantByName(function(error, data) {
    restaurants = data;
    var query = req.body.query;
    query = query.trim();
    if (!error) {
      if (restaurants.length > 0) {
        var filterdRestaurants = restaurants.filter(data =>
          data.restaurantName.toLowerCase().includes(query.toLowerCase())
        );
        if (filterdRestaurants.length > 0) {
          return res.render("filter-restaurant", {
            pageTitle: "All Restaurants",
            user: req.session.user,
            searchRestaurant: filterdRestaurants
          });
        } else {
          //renders if no restaurant found on search
          return res.render("filter-restaurant", {
            pageTitle: "All Restaurants",
            user: req.session.user,
            restro: filterdRestaurants,
            noDataFoundError: {
              errHeader: "No Restaurant Found",
              errTitle: "OOPS!",
              errMsg:
                "we couldn't find what you are looking for, mind trying something else?"
            }
          });
        }
      } else {
        //renders if no restaurant found in database
        return res.render("filter-restaurant", {
          pageTitle: "All Restaurants",
          user: req.session.user,
          noDataFoundError: {
            errHeader: "No Restaurant Found",
            errTitle: "OOPS!",
            errMsg:
              "we couldn't find what you are looking for, mind trying something else?"
          }
        });
      }
    } else {
      //renders if server error
      return res.render("filter-restaurant", {
        pageTitle: "All Restaurants",
        user: req.session.user,
        noDataFoundError: {
          errHeader: "Server Error",
          errTitle: "Sorry, Server Down",
          errMsg:
            "Please Try Again after Sometime and Sorry for the inconvinience caused to you"
        }
      });
    }
  });
});

//Consumer all restaurants page for filter by cuisine
routerConsumer.post(
  "/allrestaurants/filter",
  authController.redirectToLogin,
  function(req, res) {
    var restaurants = null;
    restaurantModel.getAllRestaurantByName(function(error, data) {
      restaurants = data;
      var cuisineRadio = req.body.cuisineRadio;
      if (!error) {
        if (restaurants.length > 0) {
          var filterRestaurants = restaurants.filter(data =>
            data.cuisine.toLowerCase().includes(cuisineRadio.toLowerCase())
          );
          if (filterRestaurants.length > 0) {
            return res.render("filter-restaurant", {
              pageTitle: "All Restaurants",
              user: req.session.user,
              filterRestaurant: filterRestaurants,
              cuisineCheck: cuisineRadio
            });
          } else {
            //renders if no restaurant found for selected cuisine
            return res.render("filter-restaurant", {
              pageTitle: "All Restaurants",
              user: req.session.user,
              filterRestaurant: filterRestaurants,
              cuisineCheck: cuisineRadio,
              noDataFoundError: {
                errHeader: "No Restaurant Found",
                errTitle: "OOPS!",
                errMsg:
                  "we couldn't find what you are looking for, mind trying something else?"
              }
            });
          }
        } else {
          //renders if no restaurant found in database for selected cuisine
          return res.render("filter-restaurant", {
            pageTitle: "All Restaurants",
            user: req.session.user,
            noDataFoundError: {
              errHeader: "No Restaurant Found",
              errTitle: "OOPS!",
              errMsg:
                "we couldn't find what you are looking for, mind trying something else?"
            }
          });
        }
      } else {
        //renders if server error
        return res.render("filter-restaurant", {
          pageTitle: "All Restaurants",
          user: req.session.user,
          noDataFoundError: {
            errHeader: "Server Error",
            errTitle: "Sorry, Server Down",
            errMsg:
              "Please Try Again after Sometime and Sorry for the inconvinience caused to you"
          }
        });
      }
    });
  }
);

//Consumer Restaurant Page
routerConsumer.get("/restaurant", authController.redirectToLogin, function(
  req,
  res
) {
  return res.render("restaurant", {
    pageTitle: "Restaurant",
    user: req.session.user
  });
});

//Save user details
routerConsumer.post(
  "/save_new_user_details",
  authController.redirectToLogin,
  function(req, res) {
    if (req.session.user) {
      var user = req.session.user;
      user.mobile = req.body.phoneNumber;
      user.email = req.body.email;
      bcryptJS.hash(req.body.password, 10, function(err, hash) {
        user.password = hash;
        UserModel.modifyUserData(user, function(err, data) {
          return res.render("user-profile-page", {
            pageTitle: "Account",
            user: req.session.user
          });
        });
      });
    } else {
      authController.redirectToLogin();
    }
  }
);

//Save user details
routerConsumer.post(
  "/save_new_user_details",
  authController.redirectToLogin,
  function(req, res) {
    if (req.session.user) {
      var user = req.session.user;
      user.mobile = req.body.phoneNumber;
      user.email = req.body.email;
      bcryptJS.hash(req.body.password, 10, function(err, hash) {
        user.password = hash;
        UserModel.modifyUserData(user, function(err, data) {
          return res.render("user-profile-page", {
            pageTitle: "Account",
            user: req.session.user
          });
        });
      });
    } else {
      authController.redirectToLogin();
    }
  }
);
routerConsumer.post("/save_issue", function(req, res) {
  if (req.session.user) {
    UserModel.saveQueries(req, function(error, response) {
      if (error) return res.send({ status: 400, message: error });
      else {
        return res.redirect("/consumer/help");
      }
    });
  } else {
    authController.redirectToLogin();
  }
});
//The 404 Route (ALWAYS Keep this as the last route)
routerConsumer.get("*", function(req, res) {
  res.status(404).render("not_found_404");
});

module.exports = routerConsumer;

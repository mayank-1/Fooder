const express = require("express");
const async = require("async");
const UserModel = require("../../models/UserModel.js");
const Uservalidator = require("../../utilities/UserValidators.js");
const authController = require("../auth/auth");
const router = express.Router();
const RestaurantModel = require("../../models/RestaurantModel");
const restaurantModel = require("./../../models/RestaurantModel");
const restaurantOwnerController = require("./restaurant/restaurant-owner.routes");
const consumerController = require("./consumer/consumer.routes");
const deliveryGuyController = require("./delivery/delivery.routes");

const roleTypeIDs = {
  consumer: "bAYc5bdCppl3dJ4jK5SdAlByrMWqqCkz",
  restaurant_owner: "0uMYzFbQFrkjcuspgZBYecJAm7gdEt1V",
  delivery_guy: "z63dxoOJ8IVy8P1RzRiOUdcFWkg9qT6V",
  admin: "oCnzKzVkQlIVrFIigsVCfR3HPmoKAROs"
};

/**
 * @example
 * router.get('/homepage',function(req,res){
 *    return res.render('handlebar-file-name');
 * })
 */

//Restaurant Owner Specific Routes
router.use("/restaurant-owner", restaurantOwnerController);

//Consumer Specific Routes
router.use("/consumer", consumerController);

//Delivery Guy Specific Routes
router.use("/delivery-guy", deliveryGuyController);

//Landing Page
router.get("/", authController.redirectToHome, function(req, res) {
  res.render("landing", { pageTitle: "Welcome" });
});

//Logout functionality
router.get("/logout", authController.redirectToLogin, function(req, res) {
  //Destroy Session
  req.session.destroy(function(err) {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("swiggy-clone");
    res.redirect("/");
  });
});

//Offers Page
router.get("/offers", authController.redirectToHome, function(req, res) {
  // return res.render("offers", { pageTitle: "Offers" });
  var restaurants = null;
  var dishes = null;
  var array = [];
  // Fetching all restaurants
  RestaurantModel.getAllRestaurants(function(error, data) {
    restaurants = data;
  });

  // fetching all dishes
  RestaurantModel.getAllDishes(function(error, data) {
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

router.get("/search", authController.redirectToHome, function(req, res) {
  // return res.render("search", { pageTitle: "Search" });
  return res.render("search", {
    pageTitle: "Search",
    user: req.session.user,
    message: "Need it ? Search it ! Grab it !"
  });
});

router.post("/search", authController.redirectToHome, function(req, res) {
  // return res.render("search", { pageTitle: "Search" });
  // return res.render("offers", { pageTitle: "Offers" });

  var restaurants = null;
  var dishes = null;

  // Fetching all restaurants
  RestaurantModel.getAllRestaurants(function(error, data) {
    restaurants = data;
    RestaurantModel.getAllDishes(function(error, data) {
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

/**
 * @param {String} route: Route where this function will get executed.
 * @param {Object.Function} : Anonymous function to handle request and response.
 */
router.post("/login", authController.redirectToHome, function(req, res) {
  //Check if the input is Mobile Number or email
  if (isNaN(req.body.user_id)) {
    //Not a number
    if (Uservalidator.validateEmail(req.body.user_id)) {
      //Valid Email
      var user = {
        user_id: req.body.user_id,
        pass: req.body.password
      };
      UserModel.login(user, function(err, data) {
        if (!err) {
          //Save entire user data to session
          req.session.user = data[0];
          //Call RoleBased routes
          if (data[0].roleTypeID === roleTypeIDs.consumer) {
            return res.redirect("/consumer/home");
          } else if (data[0].roleTypeID === roleTypeIDs.delivery_guy) {
            return res.redirect("/delivery-guy/home");
          } else if (data[0].roleTypeID === roleTypeIDs.restaurant_owner) {
            return res.redirect("/restaurant-owner/home");
          } else if (data[0].roleTypeID === roleTypeIDs.admin) {
            /**@TODO call the Admin homepage/dashboard */
          }
        } else {
          var error = {
            errorMsg: err,
            errorType: "danger"
          };
          return res.render("landing", { errorData: error });
        }
      });
    } else {
      var error = {
        errorMsg:
          "Please Enter your email address in format: yourname@example.com",
        errorType: "warning"
      };
      return res.render("landing", { errorData: error });
    }
  } else {
    //It is a number
    if (Uservalidator.validatePhoneNumber(req.body.user_id)) {
      var user = {
        user_id: req.body.user_id,
        pass: req.body.password
      };
      UserModel.login(user, function(err, data) {
        if (!err) {
          //Save entire user data to session
          req.session.user = data[0];
          //Call RoleBased routes
          if (data[0].roleTypeID === roleTypeIDs.consumer) {
            return res.redirect("/consumer/home");
          } else if (data[0].roleTypeID === roleTypeIDs.delivery_guy) {
            return res.redirect("/delivery-guy/home");
          } else if (data[0].roleTypeID === roleTypeIDs.restaurant_owner) {
            return res.redirect("/restaurant-owner/home");
          } else if (data[0].roleTypeID === roleTypeIDs.admin) {
            /**@TODO call the Admin homepage/dashboard */
          }
        } else {
          var error = {
            errorMsg: err,
            errorType: "danger"
          };
          return res.render("landing", { errorData: error });
        }
      });
    } else {
      var error = {
        errorMsg: "Please Enter a 10-digit Mobile Number",
        errorType: "warning"
      };
      return res.render("landing", { errorData: error });
    }
  }
});

/**
 * @param {String} route: Route where this function will get executed.
 * @param {Object.Function} : Anonymous function to handle request and response.
 */
router.post("/register", authController.redirectToHome, function(req, res) {
  if (Uservalidator.validatePhoneNumber(req.body.mobile_no)) {
    //Valid Mobile Number
    if (Uservalidator.validateEmail(req.body.email)) {
      //Valid Email
      UserModel.register(req, function(error, data) {
        if (!error) {
          //Save entire user data to session
          req.session.user = data;

          //Call RoleBased routes
          if (data.roleTypeID === roleTypeIDs.consumer) {
            return res.redirect("/consumer/home");
          } else if (data.roleTypeID === roleTypeIDs.delivery_guy) {
            return res.redirect("/delivery-guy/home");
          } else if (data.roleTypeID === roleTypeIDs.restaurant_owner) {
            return res.redirect("/restaurant-owner/home");
          } else if (data.roleTypeID === roleTypeIDs.admin) {
            /**@TODO call the Admin homepage/dashboard */
          }
        } else {
          var errorArray = error.errmsg.split(" ");
          if (errorArray.includes("mobile_1")) {
            var error = {
              errorMsg: "Account With this Mobile Number Already Exist",
              errorType: "warning"
            };
            return res.render("landing", { errorData: error });
          } else if (errorArray.includes("email_1")) {
            var error = {
              errorMsg: "Account with this Email Already Exist",
              errorType: "warning"
            };
            return res.render("landing", { errorData: error });
          } else {
            var error = {
              errorMsg: "Server Error, Please Try again after sometime",
              errorType: "danger"
            };
            return res.render("landing", { errorData: error });
          }
        }
      });
    } else {
      var error = {
        errorMsg:
          "Please Enter your email address in format: yourname@example.com",
        errorType: "warning"
      };
      return res.render("landing", { errorData: error });
    }
  } else {
    var error = {
      errorMsg: "Please Enter a 10-digit Mobile Number",
      errorType: "warning"
    };
    return res.render("landing", { errorData: error });
  }
});

// all restaurants page for display as guest
router.get("/allrestaurants", authController.redirectToHome, function(
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

// all restaurants page for search as guest
router.post("/allrestaurants", authController.redirectToHome, function(
  req,
  res
) {
  var restaurants = null;
  restaurantModel.getAllRestaurantByName(function(error, data) {
    restaurants = data;
    var query = req.body.query;
    query = query.trim();
    var filterdRestaurants = null;
    if (!error) {
      if (restaurants.length > 0) {
        filterdRestaurants = restaurants.filter(data =>
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

//Consumer Restaurant Page for non-logged in user
router.get("/restaurant/?:res_id", authController.redirectToHome, function(
  req,
  res
) {
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
      restaurantModel.getRestaurantById(restaurantId, function(err, response) {
        if (!err) {
          var resData = response[0];
          var userVisitedRes = resData.restaurantName;
          req.session.resOrderedFrom = userVisitedRes;
          // Full address
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
            restAddress: fullAddress
          });
        }
      });
    }
  });
});

//Handle Forgot Password
router.get("/forgotPassword", authController.redirectToHome, function(
  req,
  res
) {
  res.render("forgot-password", {
    pageTitle: "Forgot Password"
  });
});
router.post("/forgotPassword", function(req, res) {
  if (Uservalidator.validateEmail(req.body.email)) {
    UserModel.passwordReset(req.body.email, req, function(err, success) {
      if (!err) {
        res.render("forgot-password", {
          pageTitle: "Forgot Password",
          error: {
            errorType: "success",
            errorFocus: "Congrats!",
            errorMsg:
              "Password Reset Link is Sent to your Email-ID. Valid for only 2 Hours"
          }
        });
      } else {
        res.render("forgot-password", {
          pageTitle: "Forgot Password",
          error: {
            errorType: "danger",
            errorFocus: "Sorry!",
            errorMsg:
              "Can't Process Your Request. Please Try Again After Sometime"
          }
        });
      }
    });
  } else {
    res.render("forgot-password", {
      pageTitle: "Forgot Password",
      error: {
        errorType: "warning",
        errorFocus: "Oops!",
        errorMsg: "Email ID should be of form: example@gmail.com"
      }
    });
  }
});
router.get("/resetpassword/:id", function(req, res) {
  var hashID = req.params.id;
  UserModel.getPassResetLinkVerify(hashID, function(error, success) {
    if (!error) {
      //Valid Link
      req.session.userToReset = success;
      res.render("passwordreset", {
        pageTitle: "Password Reset",
        linkExpired: false
      });
    } else {
      //Link Expired
      res.render("passwordreset", {
        pageTitle: "Password Reset",
        linkExpired: true
      });
    }
  });
});
router.post("/resetpassword", function(req, res) {
  //Update the New Password
  var newPassword = req.body;
  if (newPassword.newPass === newPassword.confirmNewPass) {
    var userEmail = req.session.userToReset.email;
    var updatePass = newPassword.newPass;
    var resetInfo = { email: userEmail, pass: updatePass };
    UserModel.updatePasswordUsingPassReset(resetInfo, function(err, success) {
      if (!err) {
        res.render("passwordreset", {
          pageTitle: "Password Reset",
          resetDone: true
        });
      } else {
        res.render("passwordreset", {
          pageTitle: "Password Reset",
          linkExpired: false,
          resetDone: false,
          serverError: true
        });
      }
    });
  } else {
    res.render("passwordreset", {
      pageTitle: "Password Reset",
      linkExpired: false,
      passwordError: true
    });
  }
});

router.post(consumerController);
//The 404 Route (ALWAYS Keep this as the last route)
router.get("*", function(req, res) {
  res.status(404).render("not_found_404");
});

module.exports = router;

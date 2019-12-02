const express = require("express");
const routerRes = express.Router();
const cloudinary = require("cloudinary");

const upload = require("./../../../handlers/multer");
const auth = require("./../../auth/auth");

//Model
const RestaurantModel = require("./../../../models/RestaurantModel");

//Cloudinary Config
require("./../../../handlers/cloudinary");

//Restaurant Owner Homepage
routerRes.get("/home", auth.redirectToLogin, function(req, res) {
  RestaurantModel.getRestaurant(req.session.user._id, function(err, success) {
    if (!err) {
      //Success
      //No of restaurants
      var noOfRestaurants = success.length;
      req.session.noOfRestaurants = noOfRestaurants;
      req.session.dropdownRes = success;
      //Render the Homepage
      res.render("restaurant-owner/homepage", {
        pageTitle: "Home",
        owner: req.session.user,
        restaurantNameDropDown: req.session.dropdownRes,
        restaurantNo: req.session.noOfRestaurants
      });
    } else {
      //Falied
      //Render the Homepage
      res.render("restaurant-owner/homepage", {
        pageTitle: "Home",
        owner: req.session.user,
        error: {
          errType: "warning",
          errMsg: "No Restaurant Found. Please create one."
        }
      });
    }
  });
});

//Create New Restaurant Route
routerRes.post(
  "/home/create/restaurant",
  auth.redirectToLogin,
  function(req, res, next) {
    const uploadFile = upload.single("restaurantPhoto");

    uploadFile(req, res, function(err) {
      if (err) {
        return res.render("restaurant-owner/homepage", {
          fileNotSupportError: true,
          pageTitle: "Home",
          owner: req.session.user,
          restaurantNameDropDown: req.session.dropdownRes,
          restaurantNo: req.session.noOfRestaurants
        });
      } else {
        next();
      }
    });
  },
  async function(req, res) {
    try {
      //Got the form data
      var result = await cloudinary.v2.uploader.upload(req.file.path);
    } catch (error) {
      console.log("Error in Try Catch: ", error);
    }

    //File Uploaded to Cloudinary
    var restaurantImageURL = result.secure_url;

    //Restaurant Owner ID
    var restOwnerID = req.session.user._id;

    //Send data to Restaurant Model
    var data = {
      imgURL: restaurantImageURL,
      formData: req.body,
      restOwnerIDValue: restOwnerID
    };
    RestaurantModel.create(data, function(err, response) {
      if (!err) {
        res.render("restaurant-owner/confirmation", {
          alertType: "success",
          alertMsgStrong: "Congrats!",
          alertMsg: "Restaurant Added Successfully",
          goBackMsg: "Create More"
        });
      } else {
        res.render("restaurant-owner/confirmation", {
          alertType: "danger",
          alertMsgStrong: "Sorry!",
          alertMsg: "Something went wrong",
          goBackMsg: "Please Try Again"
        });
      }
    });
  }
);

//Create New Dish Route
routerRes.post("/home/create/restaurant/dish", auth.redirectToLogin, function(
  req,
  res
) {
  var dataForDish = {
    dishForm: req.body,
    ownerId: req.session.user._id
  };

  RestaurantModel.createDish(dataForDish, function(err, success) {
    if (!err) {
      //SUCCESS
      res.render("restaurant-owner/confirmation", {
        alertType: "success",
        alertMsgStrong: "Congrats!",
        alertMsg: "Dish Added Successfully",
        goBackMsg: "Create More"
      });
    } else {
      //ERROR
      res.render("restaurant-owner/confirmation", {
        alertType: "danger",
        alertMsgStrong: "Sorry!",
        alertMsg: "Something went wrong",
        goBackMsg: "Please Try Again"
      });
    }
  });
});

//Restaurant Owner Profile Page
routerRes.get("/profile", auth.redirectToLogin, function(req, res) {});

//The 404 Route (ALWAYS Keep this as the last route)
routerRes.get("*", function(req, res) {
  res.status(404).render("not_found_404");
});

module.exports = routerRes;

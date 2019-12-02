const express = require("express");
const routerDelivery = express.Router();

const auth = require("./../../auth/auth");

//Restaurant Owner Homepage
routerDelivery.get("/home", auth.redirectToLogin, function(req, res) {
  //Render the Homepage
  res.render("delivery-guy/homepage", {
    pageTitle: "Home",
    owner: req.session.user
  });
});

//The 404 Route (ALWAYS Keep this as the last route)
//The 404 Route (ALWAYS Keep this as the last route)
routerDelivery.get("*", function(req, res) {
  res.status(404).render("not_found_404");
});

module.exports = routerDelivery;

var authController = {};

const roleTypeIDs = {
  consumer: "bAYc5bdCppl3dJ4jK5SdAlByrMWqqCkz",
  restaurant_owner: "0uMYzFbQFrkjcuspgZBYecJAm7gdEt1V",
  delivery_guy: "z63dxoOJ8IVy8P1RzRiOUdcFWkg9qT6V",
  admin: "oCnzKzVkQlIVrFIigsVCfR3HPmoKAROs"
};

//Check whether the User Session is present or not
authController.redirectToLogin = function(req, res, next) {
  if (!req.session.user && req.path != "/") {
    return res.redirect("/");
  } else {
    next();
  }
};

//Consumer
authController.redirectToHome = function(req, res, next) {
  if (req.session.user) {
    if (Array.isArray(req.session.user)) {
      if (req.session.user[0].roleTypeID === roleTypeIDs.consumer) {
        return res.redirect("/consumer/home");
      } else if (
        req.session.user[0].roleTypeID === roleTypeIDs.restaurant_owner
      ) {
        return res.redirect("/restaurant-owner/home");
      } else if (req.session.user[0].roleTypeID === roleTypeIDs.delivery_guy) {
        return res.redirect("/delivery-guy/home");
      }
    } else if (
      typeof req.session.user === "object" &&
      req.session.user != null
    ) {
      if (req.session.user.roleTypeID === roleTypeIDs.consumer) {
        return res.redirect("/consumer/home");
      } else if (req.session.user.roleTypeID === roleTypeIDs.restaurant_owner) {
        return res.redirect("/restaurant-owner/home");
      } else if (req.session.user.roleTypeID === roleTypeIDs.delivery_guy) {
        return res.redirect("/delivery-guy/home");
      }
    }
  } else {
    next();
  }
};

module.exports = authController;

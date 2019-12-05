var User = {};
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

//User Schema
const UserSchema = require("./schemas/User.schema");

// Query Schema Model.
const QueryModel = require("./schemas/userQueries.schema");

// // Order Schema Model.
// const OrderModels = require('./schemas/order.schema');

// Address schema.
const AddressSchema = require("./schemas/addresses.schema");
const roleTypeIDs = {
  consumer: "bAYc5bdCppl3dJ4jK5SdAlByrMWqqCkz",
  restaurant_owner: "0uMYzFbQFrkjcuspgZBYecJAm7gdEt1V",
  delivery_guy: "z63dxoOJ8IVy8P1RzRiOUdcFWkg9qT6V",
  admin: "oCnzKzVkQlIVrFIigsVCfR3HPmoKAROs"
};

//PasswordReset Schema
const PassResetSchema = require("./schemas/passreset.schema");

/**
 * @todo Write the documentation.
 * @todo implement this function:
 *  1. verify login.
 *  2. send appropriate response.
 */
User.login = function(user, cb) {
  if (isNaN(user.user_id)) {
    //check with email
    user.email = user.user_id;
    UserSchema.find({ email: user.email }, function(err, data) {
      if (!err) {
        if (data.length) {
          //check the password is valid or not
          bcryptjs.compare(user.pass, data[0].password, function(err, res) {
            if (!err) {
              if (res) {
                //Valid Password
                return cb(null, data);
              } else {
                //Invalid Password
                return cb("Invalid Email and/or Password");
              }
            } else {
              return cb(
                "Oops! Server Temporarily Down. Please Try again after sometime"
              );
            }
          });
        } else {
          return cb("No Account Assosciated with this Email, Please SignUp");
        }
      }
    });
  } else {
    //check with mobile number
    UserSchema.find({ mobile: user.user_id }, function(err, data) {
      if (!err) {
        if (data.length) {
          //check the password is valid or not
          bcryptjs.compare(user.pass, data[0].password, function(err, res) {
            if (!err) {
              if (res) {
                //Valid Password
                return cb(null, data);
              } else {
                //Invalid Password
                return cb("Invalid Email and/or Password");
              }
            } else {
              //Invalid Password
              return cb(
                "Oops! Server Temporarily Down. Please Try again after sometime"
              );
            }
          });
        } else {
          return cb(
            "No Account Assosciated with this Mobile Number, Please SignUp"
          );
        }
      }
    });
  }
};

/**
 * @todo Write the documentation.
 * @todo implement this function:
 *  1. verify registration data.
 *  2. send appropriate response.
 */
User.register = function(req, cb) {
  var roleId = "";
  if (req.body.roleType === "consumer") {
    roleId = roleTypeIDs.consumer;
  } else if (req.body.roleType === "restaurant_owner") {
    roleId = roleTypeIDs.restaurant_owner;
  } else if (req.body.roleType === "delivery_guy") {
    roleId = roleTypeIDs.delivery_guy;
  }
  bcryptjs.hash(req.body.password, 10, function(err, hash) {
    if (!err) {
      var newUser = {
        roleTypeID: roleId,
        mobile: req.body.mobile_no,
        name: req.body.name,
        email: req.body.email,
        password: hash
      };

      //Save data to database
      const user = new UserSchema(newUser);
      user
        .save()
        .then(function(data) {
          return cb(null, data);
        })
        .catch(function(err) {
          return cb(err);
        });
    }
  });
};

User.passwordReset = function(data, req, callback) {
  console.log("Data to save in Collection for pass reset: ", data);
  /**
   * @TODO
   * 1 First check if the EMAIL EXIST IN DATABASE
   * 2 THEN add a new password reset hash in the password reset collection
   * 3 Create a new password reset link
   * 4 Send the link in EMAIL to the EMAIL ID to USER
   */
  // 1st check if email Exist
  var UserQuery = UserSchema.schema;
  UserSchema.find({ email: data }, function(err, success) {
    if (!err) {
      //Create a Random Hash and Save all the data to PassReset Collection
      var current_date = new Date().valueOf().toString();
      var random = Math.random().toString();
      var newHash = crypto
        .createHash("sha1")
        .update(current_date + random)
        .digest("hex");

      const newPassUser = new PassResetSchema({
        email: data,
        randomHash: newHash
      });
      newPassUser
        .save()
        .then(function(data) {
          console.log("Saved Pass Reset Data: ", data);
          //New Password Reset Link
          var passResetLink =
            req.protocol +
            "://" +
            req.get("host") +
            "/resetpassword/" +
            newHash;
          console.log("Pass Reset Link: ", passResetLink);
        })
        .catch(function(err) {
          console.log("Error: ", err);
        });
    } else {
      console.log("No account with this email Found");
    }
  });
};

/**
 * To save the queries  generated by user on help and support page.
 *
 * @param {String} req : Request variable.
 * @param {Object.function} cb : Return response to caller.
/**
 *
 *
 * @param {*} req
 * @param {*} cb
 */
User.saveQueries = function(req, cb) {
  if (req.body.queryTextArea) {
    const query = new QueryModel({
      id: `#${Math.random() * 100000000000000000}`,
      userId: req.session.user.email,
      text: req.body.queryTextArea,
      status: "Pending"
    });
    query
      .save()
      .then(function(data) {
        return cb(null, data);
      })
      .catch(function(err) {
        return cb(err, null);
      });
  }
};

User.getQueries = function(user, cb) {
  QueryModel.find({ userId: user.email }, function(err, data) {
    if (err) return cb(err, null);
    else return cb(null, data);
  });
};

// User.getOrderHistory = function(user, cb) {
//   OrderModel.find({ userId: user.email }, function(err, data) {
//     return cb(err, data);
//   });
// };

User.saveOrder = function(req, cb) {
  const query = new OrderModel({
    orderId: `#${Math.random() * 100000000000000000}`,
    items: req.body.items,
    userId: req.session.user.email,
    address: req.session.address
  });
  query
    .save()
    .then(function(data) {
      return cb(null, data);
    })
    .catch(function(err) {
      return cb(err, null);
    });
};

User.modifyUserData = function(user, cb) {
  UserSchema.updateOne({ email: user.email }, user, function(err, data) {
    return cb(err, data);
  });
};
User.getQueries = function(user, cb) {
  QueryModel.find({ userId: user.email }, function(err, data) {
    if (err) return cb(err, null);
    else return cb(null, data);
  });
};

User.getAddresses = function(user, cb) {
  AddressSchema.find({ email: user.email }, function(err, data) {
    return cb(err, data);
  });
};
module.exports = User;

var User = {};
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//User Schema
const UserSchema = require("./schemas/User.schema");

// Query Schema Model.
const QueryModel = require("./schemas/userQueries.schema");

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
  //Check if email Exist
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
        .then(function(resp) {
          if (resp) {
            //New Password Reset Link
            var passResetLink =
              req.protocol +
              "://" +
              req.get("host") +
              "/resetpassword/" +
              newHash;

            //Send Email Using Gmail
            var usersEmail = data;
            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.GMAILFOODERID,
                pass: process.env.GMAILFOODERPASS
              }
            });

            const mailOptions = {
              from: "Fooder <attainueagleproject2@gmail.com>", // sender address
              to: usersEmail, // list of receivers
              subject: "Password Reset Link - Fooder", // Subject line
              html: `<p>Hi,</p><br><p>Here is your password reset link: <a href='${passResetLink}' target='_blank'>Reset Link</a></p><br><p>Reset Link is <strong>Valid for only 2 hours</strong></p><br>Thanks & Regards<br><strong>Team Fooder</strong>` // plain text body
            };

            transporter.sendMail(mailOptions, function(err, info) {
              if (!err) {
                callback(null, "Success");
              } else {
                callback("Failed");
              }
            });
          }
        })
        .catch(function(err) {
          callback("Server Error!, Please Try Again After Sometime");
        });
    } else {
      callback("No account with this email Found");
    }
  });
};

User.getPassResetLinkVerify = function(id, callback) {
  PassResetSchema.find({ randomHash: id }, function(err, success) {
    if (!err) {
      if (success.length > 0) {
        //Valid Reset Link
        return callback(null, success[0]);
      } else {
        //Link Expired
        return callback("LINK EXPIRED");
      }
    } else {
      //Server Error
      return callback("SERVER ERROR");
    }
  });
};

User.updatePasswordUsingPassReset = function(user, callback) {
  UserSchema.find({ email: user.email }, function(err, docs) {
    if (!err) {
      if (docs.length > 0) {
        //hash the updated password
        bcryptjs.hash(user.pass, 10, function(err, hash) {
          if (!err) {
            var newUserToUpdate = docs[0];
            newUserToUpdate.password = hash;
            User.modifyUserData(newUserToUpdate, function(err, success) {
              if (!err) {
                //Also delete record from passwordreset collection
                PassResetSchema.deleteMany({ email: user.email }, function(
                  err,
                  success
                ) {
                  if (!err) {
                    //DELETED ALL THE RESET RECORDS FOR THE USER
                    return callback(null, "UPDATED");
                  }
                });
              }
            });
          }
        });
      }
    }
  });
};

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

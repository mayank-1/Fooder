const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const passResetSchema = new Schema({
  email: {
    type: String
  },
  randomHash: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200
  }
});

const PassReset = mongoose.model("PasswordReset", passResetSchema);

module.exports = PassReset;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  roleTypeID: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

var Validator = {};
Validator.validatePhoneNumber = function(phoneNumber) {
  if (phoneNumber.length < 10 || phoneNumber.length > 10) {
    return false;
  }
  // If user entered leading zeros or invalid number.
  return isNaN(phoneNumber) ? false : true;
};

Validator.validateEmail = function(email) {
  //Using Regular Expression
  var re = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return re.test(email);
};
module.exports = Validator;

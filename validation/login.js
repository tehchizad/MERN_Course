const Validator = require("validator"),
  isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  // change and empty data.name to an empty string for later validation
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Invalid email address";
  }
  
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return { errors, isValid: isEmpty(errors) };
};

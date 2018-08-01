const Validator = require("validator"),
  isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};
  // change and empty data.name to an empty string for later validation
  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, {min: 1, max: 300})) {
    errors.text = "Post must be between 1 and 300 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Post cannot be blank";
  }

  return { errors, isValid: isEmpty(errors) };
};

const express = require("express"),
  router = express.Router(),
  gravatar = require("gravatar"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  validateRegisterInput = require("../../validation/register"),
  validateLoginInput = require("../../validation/login"),
  keys = require("../../config/keys"),
  User = require("../../models/User");

//  @route  GET api/users/register
//  @access Public
router.post("/register", (req, res) => {
  let { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      let avatar = gravatar.url(req.body.email, {
        s: "200", // size of avatar
        r: "pg", // rating of content
        d: "mm" //default
      });
      let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//  @route  GET api/users/login
//  @access Public
router.post("/login", (req, res) => {
  let { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  let email = req.body.email,
    password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        let payload = { id: user.id, name: user.name, avatar: user.avatar };
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({ success: true, token: `Bearer ${token}` });
        });
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//  @route  GET api/users/current
//  @access Public
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;

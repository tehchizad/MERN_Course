const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  router = express.Router();

const Profile = require("../../models/Profile"),
  User = require("../../models/User"),
  validateProfileInput = require("../../validation/profile"),
  validateExperienceInput = require("../../validation/experience"),
  validateEducationInput = require("../../validation/education");

//  @route  GET api/profile/test
//  @access Public
router.get("/test", (req, res) => res.json({ msg: "Profile slash test" }));

//  @route  GET api/profile
//  @access Private
router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  let errors = {};

  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found for this user";
        errors.id = req.user.id;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//  @route  GET api/profile/all
//  @access Public
router.get("/all", (req, res) => {
  let errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json(err));
});

//  @route  GET api/profile/handle/:handle
//  @access Public
router.get("/handle/:handle", (req, res) => {
  let errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//  @route  GET api/profile/user/:user
//  @access Public
router.get("/user/:user_id", (req, res) => {
  let errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//  @route  POST api/profile
//  @access Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  let { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  // Skills - Spilt into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(
        profile => res.json(profile)
      );
    } else {
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          errors.handleId = profile;
          res.status(400).json(errors);
        }
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

//  @route  POST api/profile/experience
//  @access Private
router.post("/experience", passport.authenticate("jwt", { session: false }), (req, res) => {
  let { errors, isValid } = validateExperienceInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id }).then(profile => {
    let newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.experience.unshift(newExp);
    profile.save().then(profile => res.json(profile));
  });
});

//  @route  POST api/profile/education
//  @access Private
router.post("/education", passport.authenticate("jwt", { session: false }), (req, res) => {
  let { errors, isValid } = validateEducationInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id }).then(profile => {
    let newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.education.unshift(newEdu);
    profile.save().then(profile => res.json(profile));
  });
});

//  @route  DELETE api/profile/experience/:exp_id
//  @access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        let removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//  @route  DELETE api/profile/education/:edu_id
//  @access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        let removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//  @route  DELETE api/profile/
//  @access Private
router.delete("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findByIdAndRemove({ _id: req.user.id }).then(() => res.json({ succes: true }));
    })
    .catch(err => res.status(404).json(err));
});

module.exports = router;
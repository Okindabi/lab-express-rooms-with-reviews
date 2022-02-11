const { use } = require("express/lib/application");
const User = require("../models/User.model");
const Room = require("../models/Room.model");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const bcrypt = require("bcryptjs/dist/bcrypt");
const req = require("express/lib/request");
const router = require("express").Router();

//MIDDLEWARE
const checkEmailAndPassword = require("../middlewares/checkEmailAndPassword");
const isLoggedIn = require("../middlewares/isLoggedIn");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// SIGN UP PAGE
router.get("/signup", checkEmailAndPassword, (req, res) =>
  res.render("signup")
);

router.post("/signup", (req, res, next) => {
  const salt = genSaltSync(10);
  const hashedPass = hashSync(req.body.password, salt);

  User.create({
    email: req.body.email,
    password: hashedPass,
    fullName: req.body.fullName,
    slackID: req.body.slackID,
    googleID: req.body.googleID,
  })
    .then(res.redirect("/"))
    .catch((err) => {
      console.log("something went wrong, ", err);
    });
});

// LOGIN ROUTE
router.get("/login", (req, res) => res.render("login"));

router.post("/login", (req, res) => {
  let errorMessage = "Check email address or password";
  if (!req.body.email || !req.body.password) {
    return res.render("login", { errorMessage });
  }
  User.findOne({ email: req.body.email }).then((foundUser) => {
    if (!foundUser) {
      errorMessage = "user cannot be found";
      return res.render("login", { errorMessage });
    }
    const match = bcrypt.compareSync(req.body.password, foundUser.password);
    if (!match) {
      errorMessage = "password incorrect";
      return res.render("login", { errorMessage });
    } else {
      req.session.user = foundUser;
      console.log(req.session.user);
      res.redirect("/rooms");
    }
  });
});

//LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

//ALL ROOMS
router.get("/rooms", (req, res) => {
  Room.find()
    .populate("owner")
    .then((results) => {
      res.render("rooms", { results });
    });
});

//CREATE ROOM
router.get("/create-room", (req, res) => {
  res.render("create-room");
});

router.post("/create-room", isLoggedIn, (req, res) => {
  Room.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.session.user,
  }).then((results) => {
    console.log(results);
    res.redirect("/rooms");
  });
});

module.exports = router;

//

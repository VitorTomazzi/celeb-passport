const express = require('express');
const router = express.Router();

const User = require('../models/User')

const bcrypt = require("bcryptjs");
const bcryptSalt = 10;



router.get('/signup', (req, res, next) => {

  res.render('user/signup');

})

router.post('/signup', (req, res, next) => {

  let username = req.body.theUsername;
  let password = req.body.thePassword;
  let salt = bcrypt.genSaltSync(bcryptSalt);
  let hashPass = bcrypt.hashSync(password, salt);

  User.create({
      username: username,
      password: hashPass
    })
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      next(err);
    })
})


router.get('/login', (req, res, next) => {

  res.render('user/login');

})

router.post('/login', (req, res, next) => {
  let username = req.body.theUsername;
  let password = req.body.thePassword;

  User.findOne({
      'username': username
    })
    .then((userFromDB) => {
      if (!userFromDB) {

        // req.flash('error', 'Sorry, that username does not exist');

        res.redirect('/')
      }
      if (bcrypt.compareSync(password, userFromDB.password)) {
        req.session.currentuser = userFromDB; //magic line of code that logs you in
        res.redirect('/');
      } else {
        res.redirect('/');
      }
    })
    .catch((err) => {
      next(err);
    })

})

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // can't access session here
    res.redirect("/user/login");
  });
});









module.exports = router;
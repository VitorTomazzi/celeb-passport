const express = require('express');
const router = express.Router();

const User = require('../models/User')

const bcrypt = require("bcryptjs");
const bcryptSalt = 10;
const passport = require('passport');


router.get('/signup', (req, res, next) => {

  res.render('user/signup');

})

router.post('/signup', (req, res, next) => {

  let admin = false;

  if (req.user) {
    // check if logged in  
    if (req.user.isAdmin) {
      //check if logged in user in an admin if so give them true value to is admin
      admin = req.body.role ? req.body.role : false;
      // this is the same as 
      // if(req.body.role){
      //     admin= req.body.role
      // }
      // else{
      //     admin = false
      // }
    }
  }

  let username = req.body.theUsername;
  let password = req.body.thePassword;

  let salt = bcrypt.genSaltSync(bcryptSalt);
  let hashPass = bcrypt.hashSync(password, salt);

  User.create({
      username: username,
      password: hashPass,
      isAdmin: admin
    })
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      next(err);
    })
})

//route to login page
router.get('/login', (req, res, next) => {

  res.render('user/login')

})


//route for actually login in. if successful, takes you to celebrity page, if not back to login in again.
router.post("/login", passport.authenticate("local", {
  successRedirect: "/celebrity",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));


router.get("/logout", (req, res, next) => {

  req.logout(); //passport specific logout. without passport we use req.session.destroy()
  res.redirect("/user/login");

});


//route to secret page... I chose not to implement this 
// router.get('/secret', (req, res, next) => {

//   if (req.session.currentuser) {
//     res.render('user-views/secret', {
//       theUser: req.session.currentuser
//     })
//   } else {
//     res.redirect('/')
//   }
// })

//creates route to profile or myaccount page so user can delete their account if they want. gives some control to user
router.get('/profile', (req, res, next) => {
  res.render('user/profile');
})

//submits post for user to delete account from DB
router.post('/account/delete-my-account', (req, res, next) => {
  User.findByIdAndRemove(req.user._id)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      next(err);
    })
})



module.exports = router;
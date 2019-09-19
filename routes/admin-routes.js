const express = require('express');
const router = express.Router();

const User = require('../models/User');

//checks implemented
router.use((req, res, next) => {
    //force checks if user is logged in so they cant just type a pages route
    if (!req.user) {
        req.flash('error', 'please log in to use this feature');
        res.redirect('/login');
    }
    //stops users without admin access from doing this they're not supposed to like creating/deleting users
    if (!req.user.isAdmin) {
        req.flash('error', 'You do not have access to this feature');
        res.redirect('/login');
    }
    //if admin, next()
    next();
})

//sends admin to create account page to create new users
router.get('/create-new-account', (req, res, next) => {

    res.render('user/new-account');

})

//lets admin get a list of all active users
router.get('/active-users', (req, res, next) => {

    User.find()
        .then((allTheUsers) => {
            res.render('user/active-users', {
                users: allTheUsers
            })
        })
        .catch((err) => {
            next(err);
        })

})


//page where admin can delete users from DB. deletes tehm by their ID's. can only access after passing admin check above
router.post('/admin/delete/:id', (req,res,next)=>{

    User.findByIdAndRemove(req.params.id)
    .then((result)=>{

        req.flash('success', 'Account successfully deleted')
        res.redirect('/active-users') //redirects back to same page

    })
    .catch((err)=>{
        next(err);
    })
})














module.exports = router;
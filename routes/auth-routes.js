/*
const router = require('express').Router()
const passport = require('passport');

router.get('/login', (req,res) => {
    res.render('login',{user:req.user});
})

router.get('/log out',(req,res) => {
    res.send('Logged Out')
})

router.get('/google', passport.authenticate('google',{
    scope: ['profile']
}))

router.get('/google/redirect', (req, res) => {
    res.send('you reached the redirect URI');
});

module.exports = router;
*/
const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    console.log('you reached the redirect URI');
    res.redirect('/profile');
});

module.exports = router;

//http://localhost:8080/auth/google/redirect
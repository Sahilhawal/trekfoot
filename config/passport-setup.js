/*
const passport = require("passport")
const GoogleStratergy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStratergy({
            //when no id is present in url
            clientID:'243423311421-aad6c43aqkn73h0uk0ldhjvbreld32nn.apps.googleusercontent.com',
            clientSecret:'XJJUcEfeuzO7MuCdQ-d4xC_q'
        }, () => {
            // when id is present in url
        })
)
*/

/*
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {

        // passport callback function
        console.log('passport callback function fired:');
        console.log(profile);
        new User({
            googleId: profile.id,
            username: profile.displayName
        }).save().then((newUser) => {
            console.log('new user created: ', newUser);
        });
    })
);
*/

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
    console.log('serialize',user)
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        console.log("profile",profile)
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.picture
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);
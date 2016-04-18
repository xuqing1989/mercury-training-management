var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function(req,res,next) {
    if(req.user) {
        req.body.authemail = req.user.email;
        req.body.authpassword = req.user.password;
    }

    passport.use('login', new LocalStrategy({
        usernameField: 'authemail',
        passwordField: 'authpassword',
        passReqToCallback: true,
    },function(req,usr,pwd,done){
        User.findOne({email:usr,password:pwd}).exec(function(err,result){
            return result;
        }).then(function(user){
            if(user) {
                return done(null,user);
            }
            else {
                return done(null,false,{msg:'wrong'});
            }
        });
    }));

    passport.use('isLogin', new LocalStrategy({
        usernameField: 'authemail',
        passwordField: 'authpassword',
        passReqToCallback: true,
    },function(req,usr,pwd,done){
        return done(null, req.user);
    }));

    passport.use('isAdmin', new LocalStrategy({
        usernameField: 'authemail',
        passwordField: 'authpassword',
        passReqToCallback: true,
    },function(req,usr,pwd,done){
        if(req.user.role='admin') {
            return done(null, true);
        }
        return done(null,false);
    }));

    next();
};

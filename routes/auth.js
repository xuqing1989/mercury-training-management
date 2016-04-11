var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function(req,res,next) {
    if(req.user) {
        req.body.email = req.user.email;
        req.body.password = req.user.password;
    }
    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },function(req,usr,pwd,done){
        User.findOne(req.body).exec(function(err,result){
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
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },function(req,usr,pwd,done){
        return done(null, req.user);
    }));
    next();
};

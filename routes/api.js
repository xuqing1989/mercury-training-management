var router = require('express').Router();
var User = require('../models/users');
var passport = require('passport');

function genPwd(len)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

router.post('/login',function(req,res,next){
    passport.authenticate('login', function(err, user, info) {
        if (!user) return res.json({msg:'wrong'});
        else return req.login(user, function(){
            res.json({msg:'success'});
        });
    })(req, res, next);
});

router.delete('/login',function(req,res,next){
    req.logout();
    res.json(req.user);
});


router.get('/currentuser',function(req,res,next){
    res.json(req.user);
});

router.post('/adduser',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var pwd = genPwd(8);
            req.body.userdata.password = pwd;
            User.collection.insert(req.body.userdata);
            res.json({password:pwd, msg:'success'});
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.post('/resetpwd',function(req,res,next) {
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var pwd = genPwd(8);
            User.find({_id:req.body.userdata.id}).update({password:pwd}).exec(function(){
                res.json({password:pwd,msg:'success'});
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.post('/deluser',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            User.find({_id:req.body.userdata.id}).remove().exec(function(){
                res.json({msg:'success'});
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

module.exports = router;

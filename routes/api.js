var router = require('express').Router();
var User = require('../models/users');
var passport = require('passport');

router.post('/login',function(req,res,next){
    passport.authenticate('login', function(err, user, info) {
        console.log('apijs: ', err,user,info);
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
    User.collection.insert(req.body);
    res.json({msg:'success'});
});

module.exports = router;

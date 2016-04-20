var express = require('express');
var router = express.Router();
var passport = require('passport');
var Batch = require('../models/batch');

/* GET home page. */

router.get('/', function(req, res, next) {
    passport.authorize('isLogin', function(err, user, info) {
        if (!user) return res.render('login');
        else {
            if(user.role == 'teacher') {
                Batch.find({teacher:user._id}).exec(function(err,queryData){
                    res.render('dashboard',{user:user,batch:queryData});
                });
            }
            else return res.render('dashboard',{user:user});
        }
    })(req, res, next);
});

module.exports = router;

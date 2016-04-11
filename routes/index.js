var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */

router.get('/', function(req, res, next) {
    passport.authorize('isLogin', function(err, user, info) {
        if (!user) return res.render('login');
        else return res.render('dashboard');
    })(req, res, next);
});

module.exports = router;

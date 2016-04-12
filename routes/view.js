var router = require('express').Router();
var User = require('../models/users');
var passport = require('passport');


router.get('/userlist',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var teaList, stuList;
            User.find({role:'Teacher'}).exec(function(err,queryData){
                teaList = queryData;
            });
            User.find({role:'Student'}).exec(function(err,queryData){
                stuList = queryData;
            })
            .then(function(){
                res.render('userlist',{
                    teaList:teaList,
                    stuList:stuList,
                });
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

module.exports = router;

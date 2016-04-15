var router = require('express').Router();
var User = require('../models/users');
var Batch = require('../models/batch');
var passport = require('passport');


router.get('/userlist',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var teaList, stuList;
            var teaP = User.find({role:'teacher'}).exec(function(err,queryData){
                teaList = queryData;
            });
            var stuP = User.find({role:'student'}).exec(function(err,queryData){
                stuList = queryData;
            });
            Promise.all([teaP,stuP]).then(function(){
                res.render('userlist',{
                    teaList:teaList,
                    stuList:stuList,
                });
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.get('/batchlist',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var batchList;
            Batch.find().exec(function(err,queryData) {
                var batchList = queryData;
            });
            res.render('batchlist');
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

module.exports = router;

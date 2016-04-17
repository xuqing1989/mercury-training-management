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
            var stuP = User.find({role:'student'}).populate('batch').exec(function(err,queryData){
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
            var batchList=[];
            var promiseArr=[];
            Batch.find().populate('teacher').exec(function(err,queryData) {
                //clone
                batchList = JSON.parse(JSON.stringify(queryData));
                for(var key in batchList){
                    (function(key){
                        promiseArr[key] = User.find({batch:batchList[key]._id}).exec(function(err,stuData) {
                            batchList[key].students = stuData || [];
                        });
                    })(key);
                };
            }).then(function(){
                Promise.all(promiseArr).then(function(){
                    res.render('batchlist',{
                        batchList:batchList
                    });
                });
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

module.exports = router;

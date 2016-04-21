var router = require('express').Router();
var User = require('../models/users');
var Batch = require('../models/batch');
var Event = require('../models/event');
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

router.post('/changepwd',function(req,res,next){
    User.update({_id:req.user._id},{password:req.body.newpwd}).exec(function(){
        res.json({msg:'success!'});
    });
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

router.get('/userlist',function(req,res,next){
    var teaData,stuData;
    var teaP = User.find({role:'teacher'}).exec(function(err,queryData){
        teaData = queryData;
    });
    var stuP = User.find({$or:[{role:'student',batch:null},{role:'student',batch:req.query.batch}]}).exec(function(err,queryData){
        stuData = queryData;
    });
    Promise.all([teaP,stuP]).then(function(){
        res.json({teachers:teaData,students:stuData});
    });
});

router.post('/addbatch',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var batchData = req.body.batchdata;
            var stuIds = batchData.students;
            delete(batchData.students);
            Batch.collection.insert(batchData).then(function(opt){
                var batchId = opt.ops[0]._id;
                var updateArray = [];
                stuIds.forEach(function(stuid){
                    var updateOpt = User.find({_id:stuid}).update({batch:batchId}).exec();
                    updateArray.push(updateOpt);
                });
                Promise.all(updateArray).then(function(){
                    res.json({msg:'success'});
                });
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.post('/editbatch',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            var batchData = req.body.batchdata;
            var batchId = batchData._id;
            var stuIds = batchData.students;
            delete(batchData.students);
            User.update({batch:batchId},{batch:null},{multi:true}).exec().then(function(){
                delete(batchData._id);
                Batch.find({_id:batchId}).update(batchData).exec(function(){
                    var updateArray = [];
                    stuIds.forEach(function(stuid){
                        var updateOpt = User.find({_id:stuid}).update({batch:batchId}).exec();
                        updateArray.push(updateOpt);
                    });
                    Promise.all(updateArray).then(function(){
                        res.json({msg:'success'});
                    });
                });
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.post('/delbatch',function(req,res,next){
    passport.authenticate('isAdmin', function(err, result) {
        if(result){
            Batch.find({_id:req.body.batchdata.id}).remove().exec(function(){
                res.json({msg:'success'});
            });
        }
        else res.json({msg:'unauthorized!'});
    })(req, res, next);
});

router.post('/addevent',function(req,res,next){
    delete(req.body.eventData._id);
    Event.collection.insert(req.body.eventData).then(function(opt){
        res.json({msg:'success'});
    });
});

router.post('/editevent',function(req,res,next){
    var eventId = req.body.eventId;
    delete(req.body.eventData._id);
    Event.update({_id:eventId},req.body.eventData).exec(function(){
        res.json({msg:'success'});
    });
});

router.post('/deleteevent',function(req,res,next){
    var eventId = req.body.eventId;
    Event.find({_id:eventId}).remove().exec(function(){
        res.json({msg:'success'});
    });
});

router.get('/eventdata',function(req,res,next){
    var batchId = req.query.batchId;
    Event.find({batch:batchId}).exec(function(err,queryData){
        res.json(queryData);
    });
});

router.get('/eventcontent',function(req,res,next){
    var eventId = req.query.eventId;
    Event.findOne({_id:eventId}).exec(function(err,queryData){
        res.json(queryData);
    });
});

module.exports = router;

var router = require('express').Router();
var User = require('../models/users');

router.post('/login',function(req,res,next){
    User.findOne(req.body).exec(function(err,result){
        return result;
    }).then(function(user){
        if(user) {
            req.login(user, function(){
                res.json(req.user);
            });
        }
        else {
            res.json({msg:'wrong'});
        }
    });
});

router.delete('/login',function(req,res,next){
    req.logout();
    res.json(req.user);
});


module.exports = router;

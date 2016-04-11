var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = express();
var bodyParser = require( 'body-parser' );
app.use( bodyParser.urlencoded({ extended: true }) );
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({
    secret: 'QINGXUISAWESOME',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));
var User = require('./models/users');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


passport.serializeUser(function(user, done) {
    console.log("SERIALIZING USER",user);
    done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
    console.log("DE-SERIALIZING USER",id);
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./routes/auth'));
app.use('/', routes);
app.use('/api',require('./routes/api'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

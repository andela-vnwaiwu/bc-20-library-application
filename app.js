require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');

// Initialize Firebase for the application
var config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
  };

firebase.initializeApp(config);


// Middleware for Authenticating Admin, User and Logged in state
module.exports = {
  isAuthenticated: function (req, res, next) {
    var user = firebase.auth().currentUser;
    if (user !== null) {
      req.user = user;
      next();
    } else {
      res.redirect('/login');
    }
  },
  isAdmin: function (req, res, next) {
    var user = firebase.auth().currentUser;
    if (user !== null && user.email === 'victorjohn@yahoo.com') {
      req.user = user;
      next();
    } else {
      res.redirect('/login');
    }
  },

  isLoggedIn : function (req, res, next) {
    var user = firebase.auth().currentUser;
    req.user = user;
    next();
  }
};

// Initializing routes
var routes = require('./routes/index');
var users = require('./routes/user');
var auth = require('./routes/auth')(firebase);
var admin = require('./routes/admin');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Application Assets
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.sessionSecret, 
  cookie: {maxAge: 60000},
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.message = req.flash();
  next();
});

// Application routes
app.use('/', routes);
app.use('/user', users);
app.use('/auth', auth);
app.use('/admin', admin);

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
      user: req.user,
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
    user: req.user,
    message: err.message,
    error: {}
  });
});


module.exports = app;

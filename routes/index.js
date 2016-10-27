var express = require('express');
var router = express.Router();
var firebase = require('firebase');
require('firebase/auth');

isAuthenticated = function (req, res, next) {
  var user = firebase.auth().currentUser;
  req.user = user;
    // if (user === null) {
    //   req.user = null;
    //   next();
    // } else {
    //   req.user = user;
    //   next();
    // }
  };

/* GET home page. */
router.get('/', function (req, res) {
  if (req.user === null || req.user === undefined) {
    console.log(req.user);
    res.render('index', {title: 'Home', user: null});  
  } else {
    console.log(req.user);
    res.render('index', {title: 'Home', user: req.user});
  }
});

// router.use('/', isAuthenticated);

router.get('/login', function (req, res) {
  if (req.user === null) {
    console.log(req.user);
    res.render('login', {title: 'Login', user: null});
  } else {
    console.log(req.user);
    res.redirect('/');
  }
});

router.get('/signup', function (req, res) {
  if (req.user === null || req.user === undefined) {
    console.log(req.user);
    res.render('register', {title: 'Register', user: req.user});
  } else {
    console.log(req.user);
    res.redirect('/');
  }
});



module.exports = router;

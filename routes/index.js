var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/auth');

var db = firebase.database();

// make use of the firebase middleware to check if the user is logged in
router.use('/', application.isLoggedIn);

/* GET / gets the home page. */
router.get('/', function (req, res) {
  // check if the user is logged in
  if (req.user === null) {
    console.log(req.user)
    var ref = db.ref('categories');
    // query the database for the list of categories
    ref.once('value').then(function(snapshot) {
      var categories = snapshot.val();
      console.log(categories);
      return categories;
    }).then(function(categories){
      console.log(req.user);
      res.render('index', {title: 'Home', user: null, categories: categories});
    })
    .catch(function (errorObject) {
      console.log(req.user)
      console.log('The read failed: ' + errorObject.code);
      res.render('error');
    });
  } else {
    var category = db.ref('categories');
    category.once('value').then(function(snapshot) {
      var categories = snapshot.val();
      return categories;
    }).then(function(categories){
      console.log(req.user);
      res.render('index', {title: 'Home', user: req.user, categories: categories});
    })
    .catch(function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
      res.render('error');
    }); 
  }
});


/* GET /login displays the login form, 
* redirects to another page if the user is already logged in*/
router.get('/login', function (req, res) {
  if (req.user === null || req.user === undefined) {
    console.log(req.user);
    res.render('login', {title: 'Login', user: null});
  } else {
    console.log(req.user);
    res.redirect('/');
  }
});


/* GET /signup displays the signup form, 
* redirects if the user is already logged in*/
router.get('/signup', function (req, res) {
  if (req.user === null || req.user === undefined) {
    res.render('register', {title: 'Register', user: req.user});
  } else {
    res.redirect('/');
  }
});

module.exports = router;

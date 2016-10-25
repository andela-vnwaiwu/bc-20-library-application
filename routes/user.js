var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/database');

var db = firebase.database();


router.use('/', application.isAuthenticated);


/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user/index', {title: 'Users Page'});
});

router.get('/books', function(req, res) {
  var ref = db.ref('users');
  ref.on('value', function(snapshot) {
    console.log(snapshot.val());
    var users = snapshot.val();
    res.render('user/books', {title: 'Books', users: users});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});


module.exports = router;

var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/database');
// var form = require('express-form');

var db = firebase.database();


router.use('/', application.isAdmin);


/* GET admin/ */
router.get('/', function(req, res) {
  res.render('admin/index', {title: 'Users Page'});
});

/* GET admin/users 
  get the list of all users in the application
*/
router.get('/users', function(req, res) {
  var ref = db.ref('users');
  // gets a snapshot of all users in the application
  ref.on('value', function(snapshot) {
    console.log(snapshot.val());
    var users = snapshot.val();
    res.render('admin/users', {title: 'Books', users: users});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});



module.exports = router;

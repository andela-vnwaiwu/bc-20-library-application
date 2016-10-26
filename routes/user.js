var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/database');

var db = firebase.database();


router.use('/', application.isAuthenticated);


/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user/index', {title: 'Home Page'});
});

router.get('/books', function(req, res) {
  var ref = db.ref('books');
  ref.once('value').then(function(snapshot) {
    console.log(snapshot.val());
    books = snapshot.val();
    res.render('user/books', {title: 'Books', books: books});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});


module.exports = router;

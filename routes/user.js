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

router.get('/borrow/:title', function(req, res) {
  var title = req.params.title;
  var user = req.user.uid;
  var ref = db.ref('books');
  var borrow = db.ref('borrowed');
  ref.orderByChild('title').equalTo(title).limitToFirst(1).once('child_added')
    .then(function(snapshot) {
      console.log('I have started');
      var bookKey = snapshot.key;
      var book = snapshot.val();
      if (book.quantity > 1) {
        borrow.push({
          userid: user,
          bookid: bookKey,
          status: 'borrowed',
          dateBorrowed: new Date().getTime(),
          dateReturned: null,
          dateDue: new Date().getTime() + 604800000
        });
        return db.ref('books/' + bookKey).update({
          quantity: book.quantity -1
        });
      } else {
          console.log('I am finished');
          return res.redirect('/user/books');
      }
    })
    .then(function () {
      console.log('I finally made It');
      res.redirect('/user/books');
    })
    .catch(function(error) {
      console.log(error.code);
      res.render('user/books', {title: 'Books'});
    });
});


module.exports = router;

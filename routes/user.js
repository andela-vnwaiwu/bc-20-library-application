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
  var userid = req.user.uid;
  var ref = db.ref('books');
  var borrowList = db.ref('borrowed');
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    return borrowList.orderByChild('userid').equalTo(userid).once('value')
    .then(function (snapshot) {
      borrowed = snapshot.val();
      borrowedKey = snapshot.key;
      for (var key in borrowed) {
        var bookId = borrowed[key].bookid;
        if(books.hasOwnProperty(bookId) && borrowed[key].status === 'borrowed') {
          books[bookId].status = 'borrowed'; 
        }
      }
      return books;
    }).then(function(books) {
      console.log(books);
      res.render('user/books', {title: 'Books', books: books});
    });
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
          dateDue: new Date().getTime() + 60000
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

router.get('/return/:title', function(req, res) {
  var title = req.params.title;
  var user = req.user.uid;
  var ref = db.ref('books');
  var borrow = db.ref('borrowed');
  ref.orderByChild('title').equalTo(title).limitToFirst(1).once('child_added')
  .then(function(snapshot) {
    console.log('I have started');
    var bookKey = snapshot.key;
    var book = snapshot.val();
    console.log(bookKey);
    borrow.orderByChild('userid').equalTo(user).once('value')
    .then(function (snapshot) {
      var borrowed = snapshot.val();
      return borrowed;
    })
    .then(function (borrowed) {
      console.log(borrowed);
      console.log(bookKey);
      for (var key in borrowed) {
        if (borrowed[key].bookid === bookKey && borrowed[key].status === 'borrowed') {
          console.log(borrowed[key]);
          db.ref('borrowed/' +key).update({
            status: 'returned',
            dateReturned: new Date().getTime()
          });
        }
      }
    }).then(function() {
      db.ref('books/' + bookKey).update({
        quantity : book.quantity + 1
      });
    })
    .then(function (borrowed) {
      console.log('I finally made It');
      res.redirect('/user/books');
    })
    .catch(function(error) {
      console.log(error.code);
      res.render('user/books', {title: 'Books'});
    });
  });
});

router.get('/borrowedlist', function(req, res) {
  var userid = req.user.uid;
  var ref = db.ref('books');
  var userBorrowed = db.ref('borrowed');
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    return userBorrowed.orderByChild('userid').equalTo(userid).once('value')
    .then(function (snapshot) {
      borrowed = snapshot.val();
      borrowedKey = snapshot.key;
      for (var key in borrowed) {
        var bookId = borrowed[key].bookid;
        if(books.hasOwnProperty(bookId)) {
          borrowed[key].title = books[bookId].title;
          borrowed[key].author = books[bookId].author;
          borrowed[key].isbn = books[bookId].isbn;
        }
      }
      return borrowed;
    }).then(function(borrowed) {
      console.log(borrowed);
      res.render('user/borrowed', {title: 'Books', borrowed: borrowed});
    });
  });
});
module.exports = router;

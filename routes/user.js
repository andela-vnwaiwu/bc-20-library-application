var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/database');

var db = firebase.database();

// use the firebase middleware to authenticate the route
router.use('/', application.isAuthenticated);


/* GET /user gets the categories and displays to the user listing. */
router.get('/', function(req, res) {
  var ref = db.ref('categories');
  // query the category table
  ref.once('value').then(function(snapshot) {
    var categories = snapshot.val();
    return categories;
  }).then(function(categories){
    res.render('user/index', {title: 'Home', user: req.user, categories: categories});
  })
  .catch(function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
    res.render('error');
  });
});


/* GET /books gets all the list of books in the category */
router.get('/books', function(req, res) {
  var userid = req.user.uid;
  var ref = db.ref('books');
  var borrowList = db.ref('borrowed');
  // query the books table for all books
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    // query the borrowed table to retrieve any unreturned book by the user
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
      res.render('user/books', {title: 'Books', books: books, user: req.user});
    });
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});


/* GET /borrow/:title borrows a particular book according to the title provided */
router.get('/borrow/:title', function(req, res) {
  var title = req.params.title;
  var user = req.user.uid;
  var ref = db.ref('books');
  var borrow = db.ref('borrowed');
  // use the title to query the books table
  ref.orderByChild('title').equalTo(title).limitToFirst(1).once('child_added')
    .then(function(snapshot) {
      var bookKey = snapshot.key;
      var book = snapshot.val();
      // check if the book quantity is greater than zero and also set the due date
      if (book.quantity > 0) {
        borrow.push({
          userid: user,
          bookid: bookKey,
          status: 'borrowed',
          dateBorrowed: new Date().getTime(),
          dateReturned: null,
          dateDue: new Date().getTime() + 60000
        });
        // reduce the quantity of books and update
        return db.ref('books/' + bookKey).update({
          quantity: book.quantity -1
        });
      } else {
        return res.redirect('/user/books');
      }
    })
    .then(function () {
      res.redirect('/user/books');
    })
    .catch(function(error) {
      console.log(error.code);
      res.render('user/books', {title: 'Books', user: req.user});
    });
});


/* GET /return/:title returns a borrowed book by a user back in to the table and update accordingly */
router.get('/return/:title', function(req, res) {
  var title = req.params.title;
  var user = req.user.uid;
  var ref = db.ref('books');
  var borrow = db.ref('borrowed');
  // query the books table to get the Id of the book
  ref.orderByChild('title').equalTo(title).limitToFirst(1).once('child_added')
  .then(function(snapshot) {
    console.log('I have started');
    var bookKey = snapshot.key;
    var book = snapshot.val();
    // query the borrowed table by the user's id
    borrow.orderByChild('userid').equalTo(user).once('value')
    .then(function (snapshot) {
      var borrowed = snapshot.val();
      return borrowed;
    })
    .then(function (borrowed) {
      for (var key in borrowed) {
        if (borrowed[key].bookid === bookKey && borrowed[key].status === 'borrowed') {
          // update the status in the borrowed table and set the returned date
          db.ref('borrowed/' +key).update({
            status: 'returned',
            dateReturned: new Date().getTime()
          });
        }
      }
    }).then(function() {
      // update the book quantity in the books table by 1
      db.ref('books/' + bookKey).update({
        quantity : book.quantity + 1
      });
    })
    .then(function (borrowed) {
      res.redirect('/user/books');
    })
    .catch(function(error) {
      console.log(error.code);
      res.render('user/books', {title: 'Books', user: req.user});
    });
  });
});


/* GET /borrowedlist  returns a list of books borrowed by the user */
router.get('/borrowedlist', function(req, res) {
  var userid = req.user.uid;
  var ref = db.ref('books');
  var userBorrowed = db.ref('borrowed');
  // query the books table for the list of books
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    // query the borrowed table for the list of books where the userid is equal to the user's Id
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
      res.render('user/borrowed', {title: 'Books', borrowed: borrowed, user: req.user});
    });
  });
});
module.exports = router;

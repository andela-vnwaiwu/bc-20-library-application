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
  ref.once('value', function(snapshot) {
    console.log(snapshot.val());
    var users = snapshot.val();
    res.render('admin/users', {title: 'Users', users: users});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

router.get('/books', function(req, res) {
  var ref = db.ref('books');
  // gets a snapshot of all users in the application
  ref.once('value', function(snapshot) {
    console.log(snapshot.val());
    var books = snapshot.val();
    res.render('admin/users', {title: 'Books', books: books});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

router.get('/addbook', function (req, res) {
  var ref = db.ref('categories');
  ref.once('value', function(snapshot) {
    console.log(snapshot.val());
    var categories = snapshot.val();
    res.render('admin/addbook', {title: 'Books', categories: categories});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

router.post('/addbook', function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  var isbn = parseInt(req.body.isbn);
  var quantity = parseInt(req.body.quantity);
  var category = req.body.category;
  db.ref('books/').push({
    title: title,
    author: author,
    description: description,
    isbn: isbn,
    quantity: quantity,
    category: category
  }).then(function(book) {
    console.log('Books saved successfully')
    res.redirect('/admin/books');
  }).catch(function(error) {
    console.log(error.code);
    res.render('admin/addbook');
  });
});

router.get('/book/:title', function (req, res) {
  var title = req.params.name;
  db.ref('books')
   .orderByChild('title')
   .equalTo(title)
   .limitToFirst(1)
   .on('child_added', function(snapshot) {
     var book = snapshot.val();
     var bookKey = snapshot.key;
     post = {
       key: bookKey,
       title : book.title,
       author: book.author,
       description : book.description,
       isbn: book.isbn,
       category: book.category,
       quantity: book.quantity
     };
    //  res.render('admin/editcategory', req.post);
    })
    .then(function(post) {
      db.ref('categories').once('value', function(snapshot) {
        console.log(snapshot.val());
        var categories = snapshot.val();
        res.render('admin/users', {title: 'Books', categories: categories, post: post });
      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
    });
});


router.post('/book/:title', function (req, res){
  var id = req.body.bookid;
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  var isbn = req.body.isbn;
  var category = req.body.category;
  var quantity = req.body.quantity;
  console.log(id, name);
  db.ref('books/' + id).set({
    title : title,
    author: author,
    description : description,
    isbn: isbn,
    category: category,
    quantity: quantity
  }).then(function(categories) {
    console.log('Books saved successfully');
    res.redirect('/admin/books');
  }).catch(function(error) {
    console.log(error.code);
    console.log(name);
    res.redirect('admin/book/' + title);
  });
});


router.get('/allcategories', function (req, res) {
  var ref = db.ref('categories');
  ref.once('value', function(snapshot) {
    console.log(snapshot.val());
    var categories = snapshot.val();
    res.render('admin/categories', {title: 'Categories', categories: categories});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

router.get('/category/:name', function (req, res) {
  var name = req.params.name;
  db.ref('categories')
   .orderByChild('name')
   .equalTo(name)
   .limitToFirst(1)
   .on('child_added', function(snapshot) {
     var category = snapshot.val();
     var categoryKey = snapshot.key;
     req.post = {
       key: categoryKey,
       name : category.name,
       description : category.description
     };
     res.render('admin/editcategory', req.post);
    });
});


router.post('/category/:name', function (req, res){
  var id = req.body.categoryid;
  var name = req.body.name;
  var description = req.body.description;
  console.log(id, name);
  db.ref('categories/' + id).set({
    name: name,
    description: description
  }).then(function(categories) {
    console.log('Books saved successfully');
    res.redirect('/admin/allcategories');
  }).catch(function(error) {
    console.log(error.code);
    console.log(name);
    res.redirect('admin/category/' + name);
  });
});

router.post('/addcategory', function (req, res) {
  var name = req.body.name;
  var description = req.body.description;
  db.ref('categories/').push({
    name: name,
    description: description,
  }).then(function(categories) {
    console.log('Books saved successfully');
    res.redirect('/admin/allcategories');
  }).catch(function(error) {
    console.log(error.code);
    res.render('admin/allcategories');
  });
});


module.exports = router;

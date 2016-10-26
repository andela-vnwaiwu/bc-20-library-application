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

router.post('/addbook', function(req, res) {
  if(!req.form.isValid) {
    res.render('admin/addbooks');
  } else {
    var title = req.body.title;
    var author = req.body.author;
    var description = req.body.description;
    var isbn = req.body.isbn;
    var quantity = req.body.quantity;
    var category = req.body.category;
    db.ref('books/').set({
        title: title,
        author: author,
        description: description,
        isbn: isbn,
        quantity: quantity,
        category: category
      }).then(function(book) {
        console.log('Books saved successfully')
        res.redirect('/books');
      }).catch(function(error) {
        console.log(error.code);
        res.render('admin/addbooks')
      });
    // res.redirect('admin/books');
  }

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

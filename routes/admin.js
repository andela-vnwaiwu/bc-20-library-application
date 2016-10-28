var express = require('express');
var router = express.Router();
var application = require('../app');
var firebase = require('firebase');
require('firebase/database');

// reference to firebase database
var db = firebase.database();


// use the isAdmin middleware to authenticate the route
router.use('/', application.isAdmin);

 /* GET /admin */
 router.get('/', function (req, res) {
  var ref = db.ref('books');
  var userBorrowed = db.ref('borrowed');
  var user = db.ref('users');
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    return userBorrowed.orderByChild('status').equalTo('borrowed').once('value')
    .then(function (snapshot) {
      borrowed = snapshot.val();
      borrowedKey = snapshot.key;
       // loop through the borrowed list and append the book's status based on the bookId'
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
      user.once('value').then(function(snapshot) {
        users = snapshot.val();
        // loop through the borrowed list and append the user's name based on the userId'
        for (var key in borrowed) {
          var userId = borrowed[key].userid;
          if(users.hasOwnProperty(userId)) {
            borrowed[key].firstname = users[userId].firstname;
            borrowed[key].lastname = users[userId].lastname;
            borrowed[key].email = users[userId].email;
          }
        }
        res.render('admin/index', {title: 'Books', borrowed: borrowed, user: req.user});
      });
    });
  });
});

 /* GET /admin/borrowedlog gets all the borrowed log from the borrowed table*/
router.get('/borrowedlog', function (req, res) {
  var ref = db.ref('books');
  var userBorrowed = db.ref('borrowed');
  var user = db.ref('users');
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    bookKey = snapshot.key;
    return userBorrowed.once('value')
    .then(function (snapshot) {
      borrowed = snapshot.val();
      borrowedKey = snapshot.key;
       // loop through the borrowed list and append the book's status based on the bookId'
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
      user.once('value').then(function(snapshot) {
        users = snapshot.val();
        // loop through the borrowed list and append the user's name based on the userId'
        for (var key in borrowed) {
          var userId = borrowed[key].userid;
          if(users.hasOwnProperty(userId)) {
            borrowed[key].firstname = users[userId].firstname;
            borrowed[key].lastname = users[userId].lastname;
            borrowed[key].email = users[userId].email;
          }
        }
        res.render('admin/borrowed', {title: 'Books', borrowed: borrowed, user: req.user});
      });
    });
  });
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
    res.render('admin/users', {title: 'Users', users: users, user: req.user});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

/* GET /books gets all books from the database */
router.get('/books', function(req, res) {
  var ref = db.ref('books');
  var catRef = db.ref('categories');
  // get the list of all books in the books table
  ref.once('value').then(function(snapshot) {
    books = snapshot.val();
    return catRef.once('value').then(function(cat) {
      category = cat.val();
    }).then(function() {
      console.log(res.locals.message.error);
      res.render('admin/books', {title: 'Books', books: books, categories:category, user: req.user, message: res.locals.message});
    })
    .catch(function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
    return errorObject;
  });
  });
});


/* POST /addbook adds a book to the book table */
router.post('/addbook', function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  var isbn = req.body.isbn;
  var quantity = req.body.quantity.trim();
  var category = req.body.category;
  if (title === undefined || author === undefined || description === undefined || isbn === undefined || quantity === undefined || category === undefined) {
    req.flash('error', 'You did not fill the form correctly');
    res.redirect('/admin/books');
  } else {
    title = req.body.title.trim().toString();
    author = req.body.author.trim().toString();
    description = req.body.description.trim().toString();
    isbn = parseInt(req.body.isbn.trim());
    quantity = parseInt(req.body.quantity.trim());
    category = req.body.category.trim().toString();
    db.ref('books/').push({
    title: title,
    author: author,
    description: description,
    isbn: parseInt(isbn),
    quantity: parseInt(quantity),
    category: category,
    status: 'available'
    }).then(function(book) {
      console.log('Books saved successfully');
      res.redirect('/admin/books');
    }).catch(function(error) {
      console.log(error.code);
      res.render('admin/addbook', { user: req.user});
    });
  }
  
});


/* GET /book/title/:title gets a particulat book according to the title for editing*/
router.get('/book/:title', function (req, res) {
  var title = req.params.title;
  var ref = db.ref('books');
  var catRef = db.ref('categories');
  // get the title of the book to be edited and show in the form
  ref.orderByChild('title').equalTo(title).limitToFirst(1).once('child_added')
    .then(function(snapshot) {
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
     // get all the categories from the database to populate the form
     return catRef.once('value').then(function(cat) {
       categories = cat.val();
     })
    .then(function() {
      res.render('admin/editbook',  {title: 'Edit Book', post: post, categories:categories, user: req.user});
    }).catch(function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
    });
});


/* POST /book/title/:title saves an edited book back to the database */
router.post('/book/:title', function (req, res){
  var id = req.body.bookId;
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  var isbn = req.body.isbn;
  var category = req.body.category;
  var quantity = req.body.quantity;
  // update an existing book in the database with the valur of the form using the set method
  db.ref('books/' + id).set({
    title : title,
    author: author,
    description : description,
    isbn: isbn,
    category: category,
    quantity: quantity
  }).then(function() {
    console.log('Books edited successfully');
    res.redirect('/admin/books');
  }).catch(function(error) {
    console.log(error.code);

    res.redirect('admin/book/' + title, {user: req.user});
  });
});


/* GET /deletebook/:title deletes a particular book from the database */
router.get('/deletebook/:title', function (req, res) {
  var title = req.params.title;
  // get the id of the book according to the name supplied
  db.ref('books')
   .orderByChild('title')
   .equalTo(title)
   .limitToFirst(1)
   .once('child_added')
   .then(function(snapshot) {
     var category = snapshot.val();
     var categoryKey = snapshot.key;
     return categoryKey;
   })
    .then(function(categoryKey) {
      // delete the book from the category
      db.ref('books').child(categoryKey).remove();
      console.log('Book deleted successfully');
      res.redirect('/admin/books');
    }).catch(function(error) {
      console.log(error.code);
      res.redirect('/admin/books/' + name);
  });
});


/* GET /allcategories gets a list of all the categories in the database */
router.get('/allcategories', function (req, res) {
  var ref = db.ref('categories');
  // get all the categories in the database
  ref.once('value', function(snapshot) {
    var categories = snapshot.val();
    res.render('admin/categories', {title: 'Categories', categories: categories, user: req.user});
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});

/* GET /category/:name gets a particular category from the database for editing */
router.get('/category/:name', function (req, res) {
  var name = req.params.name;
  // search for a category according to the name and filter
  db.ref('categories')
   .orderByChild('name')
   .equalTo(name)
   .limitToFirst(1)
   .on('child_added', function(snapshot) {
     var category = snapshot.val();
     var categoryKey = snapshot.key;
     post = {
       key: categoryKey,
       name : category.name,
       description : category.description
     };
     res.render('admin/editcategory', {post: post, user: req.user});
    });
});

/* POST /category/:name saves the edited category back tp the database */
router.post('/category/:name', function (req, res){
  var id = req.body.categoryid;
  var name = req.body.name;
  var description = req.body.description;
  console.log(id, name);
  // replace the data of the existing item in the database 
  db.ref('categories/' + id).set({
    name: name,
    description: description
  }).then(function(categories) {
    console.log('Category Edited successfully');
    res.redirect('/admin/allcategories');
  }).catch(function(error) {
    console.log(error.code);
    console.log(name);
    res.redirect('admin/category/' + name);
  });
});


/* POST /addcategory adds a category to the category tables */
router.post('/addcategory', function (req, res) {
  var name = req.body.name;
  var description = req.body.description;
  db.ref('categories/').push({
    name: name,
    description: description,
  }).then(function(categories) {
    console.log('Category saved successfully');
    res.redirect('/admin/allcategories');
  }).catch(function(error) {
    console.log(error.code);
    res.render('admin/allcategories', {user: req.user});
  });
});


/* GET /deletecategory/:name deletes a category from the catagory table */
router.get('/deletecategory/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  // get the id of the particular category
  db.ref('categories')
   .orderByChild('name')
   .equalTo(name)
   .limitToFirst(1)
   .once('child_added')
   .then(function(snapshot) {
     var category = snapshot.val();
     var categoryKey = snapshot.key;
     return categoryKey;
   })
    .then(function(categoryKey) {
      // delete the category from the database
      db.ref('categories').child(categoryKey).remove();
      console.log('Category deleted successfully');
      res.redirect('/admin/allcategories');
    }).catch(function(error) {
      console.log(error.code);
      res.redirect('/admin/allcategories/' + name);
  });
});

module.exports = router;

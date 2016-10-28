var express = require('express');
var router = express.Router();

module.exports = function (firebase) {
/* POST auth/login handles the login with email and password */
router.post('/login', function (req, res) {
  // call the firebase method that handles the authentication process
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
  .catch(function(err) {
    var errorCode = err.code;
    var errorMessage = err.message;
    if (errorCode === 'auth/wrong-password') {
      console.log('I didnt pass');
      res.redirect('/login');
    } else {
      console.log(err.code);
      res.redirect('/login');
    }
  })
  .then(function (user) {
    res.redirect('/auth/success');
  });
});

/* POST auth/signup handles the signup process with email and password */
router.post('/signup', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var userName = req.body.name;
  var userArray = userName.split(' ');
  var firstName = userArray[0];
  var lastName = userArray[userArray.length-1];
  // call the firebase method that creates a new user
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(function (err) {
      var errorCode = err.code;
      var errorMessage = err.message;
      if (errorCode === 'auth/email-already-in-use') {
        console.log(errorCode);
        res.redirect('/signup');
      } else {
        console.log('I don tire');
        console.log(errorCode);
        console.log(errorMessage);
        res.redirect('/signup');
      }
    })
    // updates the user's profile with form name input'
    .then(function (user) {
      if (user == firebase.auth().currentUser) {
        console.log(user.uid);
        user.updateProfile({
          displayName: userName
        }).then(function () {
          console.log(user.displayName, user.email, user.role);
        }).catch(function (error) {
          console.log(error.code);
        });
        console.log(user.displayName, user.email, user.role);
        return user;
      }
    })
    // saves the user into the database after updating and signing up the user
    .then(function(user) {
      firebase.database().ref('users/' + user.uid).set({
        firstname: firstName,
        lastname: lastName,
        email: email
      });
      console.log(user.displayName, user.email, user.role);
      console.log('I passed this test');
      res.redirect('/auth/success');
    });
});

/* GET /success redirects the user to either the admin if he is an admin or users page*/
router.get('/success', function (req, res) {
  var user = firebase.auth().currentUser;
  if(user.email === 'victorjohn@yahoo.com') {
    res.redirect('/admin');
  } else {
    res.redirect('/user');
  }
});

/* GET auth/logout logs the current user out */
router.get('/logout', function (req, res) {
  firebase.auth().signOut();
  res.redirect('/login');
});

return router;
};
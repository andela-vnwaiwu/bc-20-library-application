var express = require('express');
var router = express.Router();

module.exports = function (firebase) {
  /* POST auth/login */
  router.post('/login', function (req, res) {
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function (user) {
      console.log(user);
      console.log('I passed this test');
      res.redirect('/');
    }).catch(function(err) {
      var errorCode = err.code;
      var errorMessage = err.message;
      if (errorCode === 'auth/wrong-password') {
        console.log('I didnt pass');
        // alert('Wrong password.');
      } else {
        console.log('I don tire');
        res.redirect('/login');
        // alert(errorMessage);
      }
    });
  });

  /* POST auth/signup */
  router.post('/signup', function (req, res) {
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function (user) {
      console.log('I passed this test');
      res.redirect('/');
    }).catch(function(err) {
      var errorCode = err.code;
      var errorMessage = err.message;
      if (errorCode === 'auth/wrong-password') {
        console.log('I didnt pass');
        // alert('Wrong password.');
      } else {
        console.log('I don tire');
        // alert(errorMessage);
      }
    });
  });

  firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function() {
        var user = firebase.auth().currentUser;
        user.updateProfile({
          displayName: username
        }).then(function() {
            firebase.database().ref('users/' + user.uid).set({
            username: username,
            email: email
          })
        }, function(error) {
          console.log(error.message);
        })
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });

  // /* this route redirects the user to either the admin if he is an admin or users page*/
  // router.get('/success', function (req, res) {
  //   if(req.user && req.user.role === 'admin') {
  //     res.redirect('/admin');
  //   } else {
  //     res.redirect('/issue');
  //   }
  // });

  /* GET auth/logout */
  router.get('/logout', function (req, res) {
    firebase.auth().signOut();
    // console.log(req.session.id);
    // req.session.destroy();
    // console.log(req.session);
    res.redirect('/login');
  });

  return router;
};
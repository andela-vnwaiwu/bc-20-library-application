var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {title: 'Home'});
});

router.get('/login', function (req, res) {
  if(req.user) {
    res.redirect('/');
  } else {
    res.render('login', {title: 'Login'});
  }
});

router.get('/signup', function (req, res) {
  if(req.user) {
    res.redirect('/');
  } else {
    res.render('register', {title: 'Register'});
  }
});



module.exports = router;

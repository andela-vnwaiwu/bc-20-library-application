var express = require('express');
var router = express.Router();
var application = require('../app');


router.use('/', application.isAuthenticated);


/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user/index', {title: 'Users Page'});
});

module.exports = router;

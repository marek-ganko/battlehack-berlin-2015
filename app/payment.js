var router = require('express').Router();

var braintree = require('./services/braintree');

router.get('/', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.render('index', {
      clientToken: token
    });
  });
});

router.get('/api/client-token', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.send(token);
  });
});

module.exports = router;

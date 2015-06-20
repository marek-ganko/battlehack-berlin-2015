var router = require('express').Router();

var braintree = require('./services/braintree');
var charities = require('./services/charities');

router.get('/', function (req, res) {
  charities.getCharities().done(function (charities) {

    braintree.getClientToken().done(function (token) {
      res.render('index', {
          charities: charities,
          clientToken: token
      });
    });

  });
});

router.get('/api/client-token', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.send(token);
  });
});

module.exports = router;

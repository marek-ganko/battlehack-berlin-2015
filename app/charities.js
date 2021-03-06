var router = require('express').Router();

var charities = require('./services/charities');
var users = require('./services/users');
var braintree = require('./services/braintree');

router.get('/', function (req, res) {
  charities.getCharities().done(function (data) {
    res.send(data);
  });
});

router.post('/:id/payment', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  var userEmail = req.body.email;
  var id = req.params.id;
  var paymentValue = 1;

  charities.getCharity(id).then(function (charity) {

    if (!charity) {
      res.sendStatus(404);
      return;
    }

    return braintree.createPayment(paymentValue, nonce);

  }).then(function (paymentResult) {

    if (userEmail) {
      users.updateCharityPoints(userEmail, id, 1000);
    }

    return charities.addPayment(id, paymentValue);

  }).done(function (charity) {

    res.sendStatus(200);

  });

});

module.exports = router;

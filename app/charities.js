var router = require('express').Router();

var charities = require('./services/charities');
var braintree = require('./services/braintree');

router.get('/', function (req, res) {
  charities.getCharities().done(function (data) {
    data.forEach(function (item) {
      item.coordinates = {
        latitude: 52.51666666666667 + (Math.random() - 0.5),
        longitue: 13.4 + (Math.random() - 0.5)
      };
    });
    res.send(data);
  });
});

router.post('/:id/payment', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  braintree.createPayment(1, nonce).done(function (paymentResult) {
    res.sendStatus(200);
  });
});

module.exports = router;

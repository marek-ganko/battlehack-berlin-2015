var router = require('express').Router();

var charities = require('./services/charities');
var braintree = require('./services/braintree');

router.get('/', function (req, res) {
  charities.getCharities().done(function (data) {
    data.forEach(function (item) {
      item.coordinates = {
        latitude: 52.51666666666667 + (Math.random() - 0.5),
        longitude: 13.4 + (Math.random() - 0.5)
      };
    });
    res.send(data);
  });
});

router.post('/:id/payment', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  var id = req.params.id;
  var paymentValue = 1;

  charities.getCharity(id).then(function (charity) {

    if (!charity) {
      res.sendStatus(404);
      return;
    }

    return braintree.createPayment(paymentValue, nonce);

  }).then(function (paymentResult) {

    return charities.addPayment(id, paymentValue);

  }).done(function (charity) {

    res.sendStatus(200);

  });

});

module.exports = router;

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var braintree = require('./braintree');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.render('index', {
        clientToken: token
    });
  });
});

app.post('/payment-methods', function (req, res) {
  var nonce = req.body.payment_method_nonce;

  braintree.createPayment(300, nonce).done(function (paymentResult) {
    res.send(paymentResult);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

var express = require('express');
var app = express();

var bodyParser = require('body-parser')
var braintree = require('./braintree');

app.use(bodyParser.json());


app.get('/', function (req, res) {
  braintree.getClientToken().done(function(token) {
    res.send('Hello World! Token ' + token);
  });
});

app.post('/payment-methods', function(req, res){
  var nonce = req.body.payment_method_nonce;

  braintree.createPayment(30000, nonce).done(function(paymentResult) {
    console.log(paymentResult);
    res.send(paymentResult);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

var express = require('express');
var bb = require('express-busboy');
var app = express();

bb.extend(app, {
    upload: true,
    path: __dirname + '/file-uploads'
});

// CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

var bodyParser = require('body-parser');
var braintree = require('./braintree');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.render('index', {
        clientToken: token
    });
  });
});

app.get('/api/client-token', function (req, res) {
  braintree.getClientToken().done(function (token) {
    res.send(token);
  });
});

app.post('/payment-methods', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  console.log('Creating payment: ' + nonce);
  braintree.createPayment(300, nonce).done(function (paymentResult) {
    console.log(paymentResult);
    res.send(paymentResult);
  });
});

// E-MAIL RETRIEVING - registering a charity
app.post('/inbound-mail', function (req, res) {
  console.log('Mail retrieved');
  console.log(req);

  res.send(200);
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

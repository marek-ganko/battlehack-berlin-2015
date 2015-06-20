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

/**
 * DB
 */
var mongojs = require('mongojs');
var charitiesCollectionName = 'charities';
var mongoDbAddress = process.env.MONGOLAB_URI || 'payitforward';
var db = mongojs(mongoDbAddress, [charitiesCollectionName]);
var charities = db.collection(charitiesCollectionName);

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

app.post('/api/transaction', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  braintree.createPayment(300, nonce).done(function (paymentResult) {
    res.sendStatus(200);
  });
});

app.post('/payment-methods', function (req, res) {
  var nonce = req.body.payment_method_nonce;
  braintree.createPayment(300, nonce).done(function (paymentResult) {
    res.send(paymentResult);
  });
});

// E-MAIL RETRIEVING - registering a charity
app.post('/inbound-mail', function (req, res) {
  console.log('Mail retrieved');
  console.log(req.body);

  var charity = {
    name: req.body.subject,
    description: req.body.text,
    creator: req.body.from
  };

  charities.insert(charity);

  res.sendStatus(200);
});

app.get('/charities', function (req, res) {
  charities.find({}, function (err, data) {
    if (err) {
      throw err;
    }

    data.forEach(function (item) {
      item.coordinates = {
        latitude: 52.51666666666667 + (Math.random() - 0.5),
        longitue: 13.4 + (Math.random() - 0.5)
      };
    });
    res.send(data);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

var express = require('express');
var app = express();

var braintree = require('./braintree');


app.get('/', function (req, res) {
  braintree.getClientToken().done(function(token) {
    res.send('Hello World! Token ' + token);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

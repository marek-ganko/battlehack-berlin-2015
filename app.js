var express = require('express');
var bb = require('express-busboy');
var app = express();
bb.extend(app,{
  upload: true,
  path: __dirname + "/file-uploads"
});

var braintree = require('./braintree');


app.get('/', function (req, res) {
  braintree.getClientToken().done(function(token) {
    res.send('Hello World! Token ' + token);
  });
});

//E-MAIL RETRIEVING - registering a charity
app.post('/inbound-mail',function(req, res){
  console.log('Mail retrieved');
  console.log(req);

  res.send(200);
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

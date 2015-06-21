var express = require('express');
var bodyParser = require('body-parser');
var cors = require('./cors');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(cors);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(require('./app/mail'));
app.use(require('./app/payment'));
app.use('/api/charities', require('./app/charities'));
app.use('/api/users', require('./app/users'));

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

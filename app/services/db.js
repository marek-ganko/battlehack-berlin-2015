var mongojs = require('mongojs');

var mongoDbAddress = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/payitforward';
var db = mongojs(
  mongoDbAddress,
  ['charities']
);

module.exports = db;


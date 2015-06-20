var mongojs = require('mongojs');

var mongoDbAddress = process.env.MONGOLAB_URI || 'payitforward';
var db = mongojs(
  mongoDbAddress,
  ['charities']
);

module.exports = db;


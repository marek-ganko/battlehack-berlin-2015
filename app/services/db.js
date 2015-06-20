var mongojs = require('mongojs');

var mongoDbAddress = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/payitforward';
var db = mongojs(
  mongoDbAddress,
  ['charities']
);

db.asId = function (id) {
  return mongojs.ObjectId(id);
};

module.exports = db;


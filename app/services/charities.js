var db = require('./db');
var Q = require('q');

var charities = db.collection('charities');

module.exports = {

  getCharities: function () {
    return Q.ninvoke(charities, 'find', {});
  },

  insertCharity: function (charity) {
    return Q.ninvoke(charities, 'insert', charity);
  }

};


var db = require('./db');
var Q = require('q');

var charities = db.collection('charities');

var pusher = require('./pusher');

module.exports = {

  getCharity: function (id) {
    return Q.ninvoke(charities, 'find', {
      _id: id
    });
  },

  getCharities: function () {
    return Q.ninvoke(charities, 'find', {});
  },

  insertCharity: function (charity) {
    return Q.ninvoke(charities, 'insert', charity);
  },

  addPayment: function (charityId, paymentValue) {
    return Q.ninvoke(charities, 'update', {
      _id: charityId
    }, {
      $inc: {
        funds: paymentValue
      }
    }).then(function (charity) {

      pusher.updateCharity(charity);
      return charity;

    });
  }

};


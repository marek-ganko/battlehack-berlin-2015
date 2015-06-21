var db = require('./db');
var Q = require('q');

var charities = db.collection('charities');

var pusher = require('./pusher');

module.exports = {

  getCharity: function (id) {
    return Q.ninvoke(charities, 'find', {
        _id: db.asId(id)
    });
  },

  getCharities: function () {
    return Q.ninvoke(charities, 'find', {});
  },

  insertCharity: function (charity) {
    var self = this;
    return Q.ninvoke(charities, 'insert', charity).then(function (data) {

      self.getCharities().then(function (charities) {
        pusher.updateAllCharities(charities);
      });

      return data;
    });
  },

  addPayment: function (charityId, paymentValue) {
    return Q.ninvoke(charities, 'findAndModify', {
        query: {
          _id: db.asId(charityId)
        },
        update: {
          $inc: {
            funds: paymentValue
          }
        }
    }).then(function (charity) {
      pusher.updateCharity(charity[0]);
      return charity[0];
    });
  }

};


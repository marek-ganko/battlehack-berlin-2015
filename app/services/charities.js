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
    charity.funds = 0;
    charity.points = 1000;

    return Q.ninvoke(charities, 'insert', charity).then(function (data) {

      self.getCharities().then(function (charities) {
        pusher.updateAllCharities(charities);
      });

      return data;
    });
  },

  updatePoints: function(charityId, points) {
    return Q.ninvoke(charities, 'findAndModify', {
        query: {
          _id: db.asId(charityId)
        },
        update: {
          $inc: {
            points: points
          }
        },
        new: true
    }).then(function (charity) {
      pusher.updateCharity(charity[0]);
      return charity[0];
    });
  },

  addPayment: function (charityId, paymentValue) {
    return Q.ninvoke(charities, 'findAndModify', {
        query: {
          _id: db.asId(charityId)
        },
        update: {
          $inc: {
            funds: paymentValue,
            points: paymentValue * 1000
          }
        },
        new: true
    }).then(function (charity) {
      pusher.updateCharity(charity[0]);
      return charity[0];
    });
  }

};


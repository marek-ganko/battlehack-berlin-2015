var db = require('./db');
var Q = require('q');

var users = db.collection('users');
var pusher = require('./pusher');

/*
 * Format
 * {
   * email: '',
   * coordinates: {}
   * charities: {
     * [charityId] : {
       * points: 1000,
       * lvl: 1
       }
    }
  }
*/

var Users = {

  getUserByMail: function (email) {
    return Q.ninvoke(users, 'update', {
        email: email
      },{
        $set: {
          email: email,
          charities: {}
        }
      },{
        upsert: true
    }).then(function (data) {
      return data[0];
    });
  },

  getUsers: function () {
    return Q.ninvoke(users, 'find', {});
  },

  updatePosition: function (email, newCoords) {
    return Q.ninvoke(users, 'findAndModify', {
      query: {
        email: email
      },
      update: {
        $set: {
          coordinates: newCoords
        },
      },
      new: true,
      upsert: true
    }).then(function (data) {
      pusher.updateUser(data[0]);
      return data[0];
    });
  },

  updateCharityPoints: function (email, charityId, points) {
    var update = {};
    update['charities.' + charityId] = points;

    return Q.ninvoke(users, 'findAndModify', {
      query: {
        email: email
      },
      update: {
        $inc: update
      },
      new: true,
      upsert: true
    }).then(function (data) {
      pusher.updateUser(data[0]);
      return data[0];
    });
  }

};

module.exports = Users;

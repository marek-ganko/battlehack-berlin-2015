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
    return Q.ninvoke(users, 'find', {
        email: email
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
    return this.getUserByMail(email).done(function (user) {
      var c = user? user.charities : {} || {};
      c = c[charityId] || {
        points: 0,
        lvl: 1
      };

      var update = {};
      update['charities.' + charityId] = {
        points: c.points + points,
        lvl: c.lvl
      };

      return Q.ninvoke(users, 'findAndModify', {
        query: {
          email: email
        },
        update: {
          $set: update
        },
        new: true,
        upsert: true
      }).then(function (data) {
        pusher.updateUser(data[0]);
        return data[0];
      });
    });
  }

};

module.exports = Users;

var Pusher = require('pusher');

var pusher = Pusher.forURL(process.env.PUSHER_URL || 'http://6d79a55875455ca4d124:94090fecc44331651fda@api-eu.pusher.com/apps/126034');

module.exports = {

  updateCharity: function (charity) {
    pusher.trigger('charity', 'update', charity);
  }

};

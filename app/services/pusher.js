var Pusher = require('pusher');

var pusherUrl = process.env.PUSHER_URL || 'http://6d79a55875455ca4d124:94090fecc44331651fda@api-eu.pusher.com/apps/126034';
var pusher = Pusher.forURL(pusherUrl);

pusher.domain = 'api-eu.pusher.com';

module.exports = {

  updateCharity: function (charity) {
    pusher.trigger('charity', 'update', charity);
  }

};

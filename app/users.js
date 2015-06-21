var router = require('express').Router();

var users = require('./services/users');
var charities2 = require('./services/charities');

router.get('/', function (req, res) {
  users.getUsers().done(function (data) {
    res.send(data);
  });
});

router.put('/:email', function (req, res) {
  var email = req.params.email;
  var newCoords = req.body;

  // Update all charities that are close to him
  var distance = function(c1, c2) {
    return getDistanceFromLatLonInM(c1.latitude, c1.longitude, c2.latitude, c2.longitude);
  };

  charities2.getCharities().then(function (charities) {
    charities.filter(function (charity) {
      var d = distance(charity.coordinates, newCoords);
      return d < 10;
    }).map(function (charity) {
      charities2.updatePoints(charity._id, 5);
      users.updateCharityPoints(email, charity._id, 5);
    });

    return users.updatePosition(email, newCoords);
  }).done(function () {
    res.sendStatus(200);
  });
});

module.exports = router;



function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d / 1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

var router = require('express').Router();

var users = require('./services/users');

router.get('/', function (req, res) {
  users.getUsers().done(function (data) {
    res.send(data);
  });
});

router.put('/:email', function (req, res) {
  var email = req.params.email;
  users.updatePosition(email, req.body).done(function () {
    res.sendStatus(200);
  });
});

module.exports = router;

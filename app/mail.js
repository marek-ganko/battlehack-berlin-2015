var router = require('express').Router();
var charities = require('./services/charities');

// E-MAIL RETRIEVING - registering a charity
router.post('/inbound-mail', function (req, res) {
  console.log('Mail retrieved');
  console.log(req.body);

  var charity = {
    name: req.body.subject,
    description: req.body.text,
    creator: req.body.from
  };

  charities.insertCharity(charity).done(function () {
    res.sendStatus(200);
  });

});

module.exports = router;

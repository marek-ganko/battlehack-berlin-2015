
var braintree = require('braintree');
var Q = require('q');

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '6hdtxfwxh4g8782q',
    publicKey:    'kt6d4mnc2z3whwsg',
    privateKey:   '471f937ea5f25e5ee92538ae57eef7a8'
});


module.exports = {

  getClientToken: function() {
    return Q.ninvoke(gateway.clientToken, 'generate', {}).then(function(response) {
      return response.clientToken;
    });
  }

};

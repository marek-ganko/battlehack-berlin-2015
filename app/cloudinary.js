var cloudinary = require('cloudinary');
var Q = require('q');

cloudinary.config({
  cloud_name: 'hm4dqqzmq',
  api_key: '358276351164256',
  api_secret: 'D6zAMP_jfhgk7X2WsZKVnXjJpB4'
});

module.exports = {

  /**
   * @param stream
   * @return {{stream:FileStream,promise: Promise}}
   */
  uploadStream: function (stream) {
    var deferred = Q.defer();

    return {
      promise: deferred.promise,
      stream: cloudinary.uploader.upload_stream(function (result) {
        deferred.resolve(result);
      })
    };
  }
};

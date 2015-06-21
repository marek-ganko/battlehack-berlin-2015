var cloudinary = require('cloudinary');
var Q = require('q');

cloudinary.config({
  cloud_name: 'hm4dqqzmq',
  api_key: '358276351164256',
  api_secret: 'D6zAMP_jfhgk7X2WsZKVnXjJpB4'
});

module.exports = {

  /**
   * @return {{stream:FileStream,promise: Promise}}
   */
  uploadStream: function () {
    var deferred = Q.defer();

    var uploaderStream = cloudinary.uploader.upload_stream(function (result) {
      if (result.error){
        deferred.reject()
      }else{
        deferred.resolve(result);
      }
    },function(error){
      deferred.reject(error);
    });

    return {
      promise: deferred.promise,
      stream: uploaderStream
    };
  }
};

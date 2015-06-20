var router = require('express').Router();
var charities = require('./services/charities');
var Busboy = require('busboy');
var ExifImage = require('exif').ExifImage;
var Q = require('q');
var cloudinary = require('./cloudinary');

// E-MAIL RETRIEVING - registering a charity
router.post('/inbound-mail', function (req, res) {
  console.log('Mail retrieved');

  getCharityFromRequest(req).then(function (charity) {
    return charities.insertCharity(charity);
  }).then(function () {
    res.sendStatus(200);
  }, function () {
    res.sendStatus(500);
  }).done();
});

function getCharityFromRequest (req) {
  var charity = {};
  var deferred = Q.defer();
  var busboy = new Busboy({headers: req.headers});

  var fileParsingPromise;
  busboy.on('file', function (fieldname, fileStream, filename, encoding, mimetype) {
    if ((fileParsingPromise) && !isValidImageMimeType(mimetype)) {  // support only the first file in the attachment
      fileStream.resume();
    }
    var fileParsinDeferred = Q.defer();
    fileParsingPromise = fileParsinDeferred.promise;

    var streamUpload = cloudinary.uploadStream();
    fileStream.pipe(streamUpload.stream);

    Q.all([streamUpload.promise, getCoordinatesFromStream(fileStream)])
      .then(function (result) {
        var imageData = result[0];
        var coordinates = result[1];
        if (coordinates) {
          charity.coordinates = coordinates;
        }
        charity.image = imageData;
        fileParsinDeferred.resolve();
      });
  });
  busboy.on('field', function (fieldname, val) {
    insertFieldToChartIfPossible(fieldname, val, charity);
  });
  busboy.on('finish', function () {
    if (!fileParsingPromise) {
      fileParsingPromise = Q.when(null);
    }

    fileParsingPromise.then(function () {
      deferred.resolve(charity);
    });
  });

  req.pipe(busboy);

  return deferred.promise;
}

function getCoordinatesFromStream (fileStream) {
  return getBufferFromFileStream(fileStream)
    .then(getCoordinatesFromBuffer);
}

function isValidImageMimeType (mimeType) {
  return mimeType.split('/')[0].toLowerCase() === 'image';
}

function getBufferFromFileStream (fileStream) {
  var deferred = Q.defer();

  var dataParts = [];
  fileStream.on('data', function (data) {
    dataParts.push(data);
  });
  fileStream.on('end', function () {
    deferred.resolve(Buffer.concat(dataParts));
  });

  return deferred.promise;
}

var fieldnameToCharityProperty = {
  subject: 'name',
  text: 'description',
  from: 'creator'
};

function insertFieldToChartIfPossible (fieldname, val, charity) {
  console.log('Field [' + fieldname + ']: value: ' + val);
  var charityPropertyName = fieldnameToCharityProperty[fieldname];
  if (charityPropertyName) {
    charity[charityPropertyName] = val;
  }
}

function convertGpsValue (gpsValue) {
  return gpsValue[0] + (gpsValue[1] / 60) + (gpsValue[2] / 3600);
}

function getCoordinatesFromBuffer (buffer) {
  var deferred = Q.defer();
  /*jshint nonew: false */
  (new ExifImage({image: buffer}, function (error, exifData) {
    if (error) {
      deferred.reject(coordinates);
    }
    var coordinates;
    if (exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
      coordinates = {
        latitude: convertGpsValue(exifData.gps.GPSLatitude),
        longitude: convertGpsValue(exifData.gps.GPSLongitude)
      };
    }
    deferred.resolve(coordinates);
  }));

  return deferred.promise;
}

module.exports = router;

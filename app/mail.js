var router = require('express').Router();
var charities = require('./services/charities');
var Busboy = require('busboy');
var ExifImage = require('exif').ExifImage;
var Q = require('q');
//var blobUtil = require('blob-util');
//var bufferToArrayBuffer = require('buffer-to-arraybuffer');

// E-MAIL RETRIEVING - registering a charity
router.post('/inbound-mail', function (req, res) {
  console.log('Mail retrieved');

  getCharityFromRequest(req).then(function (charity) {
    charity.name = charity.name || 'No name';
    charity.image = charity.image || 'http://lorempixel.com/800/200';
    return charities.insertCharity(charity);
  }).then(function () {
    console.log("Success");
    res.sendStatus(200);
  }, function (error) {
    console.log("Error" + JSON.stringify(error));
    res.sendStatus(500);
  }).done();
});

function getCharityFromRequest(req) {
  var charity = {};
  var deferred = Q.defer();
  var busboy = new Busboy({headers: req.headers});

  var fileParsingPromise;
  busboy.on('file', function (fieldname, fileStream, filename, encoding, mimetype) {
    console.log('Processing file [' + fieldname + '] filename=' + filename + ' mime=' + mimetype)
    if ((fileParsingPromise) && !isValidImageMimeType(mimetype)) {  // support only the first file in the attachment
      fileStream.resume();
      console.log("file ignored");
      return
    }
    var fileParsinDeferred = Q.defer();
    fileParsingPromise = fileParsinDeferred.promise;

    getBufferFromFileStream(fileStream).then(function (buffer) {
      return Q.all([getImageBlobFromBuffer(buffer, mimetype), getCoordinatesFromBuffer(buffer)]);
    }).then(function (result) {
      var coordinates = result[1];
      var blob = result[0];
      if (coordinates) {
        charity.coordinates = coordinates;
      }
      if (blob) {
        charity.image = blob;
      }

      fileParsinDeferred.resolve();
    }).done();
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
    }, function (error) {
      deferred.reject(error)
    });
  });

  req.pipe(busboy);

  return deferred.promise;
}

function getImageBlobFromBuffer(buffer, mime) {
  var deferred = Q.defer();

  var byteArray = new Uint8Array(buffer);
  var blob = mime+";base64,"+byteArrayToBase64(byteArray);

  deferred.resolve(blob);

  return Q.when(blob)
}

function isValidImageMimeType(mimeType) {
  return mimeType.split('/')[0].toLowerCase() === 'image';
}

function getBufferFromFileStream(fileStream) {
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

function insertFieldToChartIfPossible(fieldname, val, charity) {
  //console.log('Field [' + fieldname + ']: value: ' + val);
  var charityPropertyName = fieldnameToCharityProperty[fieldname];
  if (charityPropertyName) {
    charity[charityPropertyName] = val;
    console.log('Field [' + fieldname + ']: value: ' + val);
  }
}

function convertGpsValue(gpsValue) {
  return gpsValue[0] + (gpsValue[1] / 60) + (gpsValue[2] / 3600);
}

function getCoordinatesFromBuffer(buffer) {
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

function byteArrayToBase64 (input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

module.exports = router;

var qr = require('qr-image');
var fs = require('fs');
var crypto = require('crypto');

var builder = {
    build: (input, callback) => {

        var image_name = crypto.randomBytes(6).toString('hex') + '.png';

        qr.image(input, { type: 'png' })
            .pipe(fs.createWriteStream(image_name)
                .on('close',() => callback(image_name)));
    }
}

exports.builder = builder;
const request = require('request');
const errorManager = require('../util/error').errorManager;

var volume = {
    getVolume: (currency) => new Promise((resolve, reject) => {

        if (currency === "") {
            reject("Write `/volume <ticker>` to get the volume.\nFor example: /volume ETH")
        } else {

            var uri = `https://${process.env.ITT_API_HOST}/volume?transaction_currency=${currency}`;

            request(uri, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body)
                    if ('volume' in info) {
                        var retrievedVolume = parseFloat(info['volume']).toFixed(3);
                        resolve(`${currency}\n24h Volume: ${retrievedVolume} BTC\nLast update: ${info.timestamp.split('.')[0]}`);
                    } else {
                        console.log(response);
                        reject(errorManager.currency_error);
                    }
                }
                else {
                    reject(errorManager.generic_error_message);
                }
            });
        }
    })
}

exports.volume = volume;
const request = require('request');

var volume = {
    getVolume: (coin) => new Promise((resolve, reject) => {

        if (coin === "") {
            reject("Write `/volume <ticker>` to get the volume.\nFor example: /volume ETH")
        } else {

            var uri = `https://${process.env.ITT_API_HOST}/volume?coin=${coin}`;

            request(uri, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body)
                    if ('volume' in info) {
                        var retrievedVolume = parseFloat(info['volume']).toFixed(3);
                        resolve(`${coin}\n24h Volume: ${retrievedVolume} BTC\nLast update: ${info.timestamp.split('.')[0]}`);
                    } else {
                        console.log(response);
                        reject('Coin not found');
                    }
                }
                else {
                    reject('Uh-Oh, something went wrong! Please retry...');
                }
            });
        }
    })
}

exports.volume = volume;
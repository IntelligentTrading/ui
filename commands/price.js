const request = require('request');

var price = {
    getPrice: (coin) => new Promise((resolve, reject) => {

        if (coin === "") {
            reject("Write `/price <ticker>` to get the latest price.\nFor example: /price ETH")
        } else {

            var uri = `https://${process.env.ITT_API_HOST}/price?coin=${coin}`;

            request(uri, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body)
                    if ('price' in info) {
                        var retrievedPrice = parseFloat(info['price'] / 100000000);
                        resolve(`${coin}\nPrice: ${retrievedPrice} BTC\nLast update: ${info.timestamp.split('.')[0]}`);
                    } else {
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


exports.price = price;
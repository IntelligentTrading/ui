const request = require('request');
const errorManager = require('../util/error').errorManager;
require('../util/extensions');

var price = {
    getPrice: (coin) => new Promise((resolve, reject) => {

        if (coin === "") {
            reject("Write `/price <ticker>` to get the latest price.\nFor example: /price ETH")
        } else {
            try {
                var uri = `https://${process.env.ITT_API_HOST}/price?coin=${coin}`;

                request(uri, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body)
                        if ('price_satoshis' in info) {
                            var retrievedPrice = parse_info(info);
                            resolve(retrievedPrice);
                        } else {
                            reject('Coin not found');
                        }
                    }
                    else {
                        errorManager.handleException(error);
                    }
                });
            }
            catch (error) {
                errorManager.handleException(error);
            }
        }
    })
}

exports.price = price;

function parse_info(info_data) {

    try {


        var retrieved_price;
        var price_change_sign;

        if (info_data.coin == 'BTC') {
            retrieved_price = `${parseFloat(info_data['price_usdt']).toFixed(2)} USD`;
        }
        else
            retrieved_price = `${parseFloat(info_data['price_satoshis'] / 100000000).toFixed(4)} BTC`;

        if (info_data.price_satoshis_change > 0)
            price_change_sign = '↗️';
        else if (info_data.price_satoshis_change < 0)
            price_change_sign = '↘️';
        else
            price_change_sign = '➡️';

        return `${info_data.coin}\nPrice: ${retrieved_price} (${(info_data.price_satoshis_change * 100).toFixed(2)}% ${price_change_sign})\nLast update: ${info_data.timestamp.split('.')[0]}\nSource: ${info_data.source.toSentenceCase()}`;
    }
    catch (err) {
        return errorManager.handleException(err);
    }
}

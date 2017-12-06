const request = require('request');
const errorManager = require('../util/error').errorManager;
var tickers = require('./data/tickers').tickers;
require('../util/extensions');


var price = {
    getPrice: (currency) => new Promise((resolve, reject) => {

        if (currency === "") {
            reject("Write `/price <ticker>` to get the latest price.\nFor example: /price ETH")
        } else {
            try {
                var uri = `https://${process.env.ITT_API_HOST}/price?coin=${currency}`;

                request(uri, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body)
                        if ('price_satoshis' in info) {
                            parse_info(info)
                                .then((retrievedPrice) => {
                                    resolve(retrievedPrice);
                                });
                        } else {
                            reject('Currency not found');
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

    var currency_wiki_data;
    const wiki_url = "https://coinmarketcap.com/currencies";

    return tickers.get()
        .then((tkrs) => {
            var matching_tkrs = tkrs.filter(t => t.symbol == info_data.coin);
            currency_wiki_data = matching_tkrs[0];

            if (currency_wiki_data == undefined) throw new Error(`Wiki not found for ${info_data.coin}!`);
            var currency_wiki = `*${currency_wiki_data.name}, *[${currency_wiki_data.symbol}](${wiki_url}/${currency_wiki_data.name})*, Rank #${currency_wiki_data.rank}*`

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

            return `${currency_wiki}\nPrice: ${retrieved_price} (${(info_data.price_satoshis_change * 100).toFixed(2)}% ${price_change_sign})\nLast update: ${info_data.timestamp.split('.')[0]}\nSource: ${info_data.source.toSentenceCase()}`;
        })
        .catch(reason => errorManager.handleException(reason));
}

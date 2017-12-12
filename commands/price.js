const request = require('request');
const errorManager = require('../util/error').errorManager;
var tickers = require('./data/tickers').tickers;
require('../util/extensions');
var api = require('../core/api').api;


var price = {
    getPrice: (currency) => {

        return api.price(currency)
            .then(result => {
                var info = JSON.parse(result)
                if ('price' in info) {
                    return parse_info(info);
                } else {
                    return 'Currency not found';
                }
            })
            .catch(reason => {
                console.log(reason);
                return "Write `/price <ticker>` to get the latest price.\nFor example: /price ETH";
            });
    }
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

            if (info_data.base_coin == 0) {
                retrieved_price = `${parseFloat(info_data['price']/100000000).toFixed(6)} BTC`;
            }
            else
                retrieved_price = `${parseFloat(info_data['price']).toFixed(2)} USD`; //!It might be not correct

            if (info_data.price_change > 0)
                price_change_sign = '↗️';
            else if (info_data.price_change < 0)
                price_change_sign = '↘️';
            else
                price_change_sign = '➡️';

            return `${currency_wiki}\nPrice: ${retrieved_price} (${(info_data.price_change * 100).toFixed(2)}% ${price_change_sign})\nLast update: ${info_data.timestamp.split('.')[0]}\nSource: ${info_data.source.toSentenceCase()}`;
        })
        .catch(reason => errorManager.handleException(reason));
}

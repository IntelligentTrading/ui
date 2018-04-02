const request = require('request');
const errorManager = require('../util/error').errorManager;
var tickers = require('./data/tickers').tickers;
require('../util/extensions');
var api = require('../core/api').api;


var price = {
    getPrice: (currency) => {

        return api.price(currency)
            .then(json => {
                var info = JSON.parse(json)
                if ('results' in info) {
                    return parse_info(info.results[0]);
                } else {
                    return 'Currency not found';
                }
            })
    }
}

exports.price = price;


/*{
    "count": 187206,
    "next": "https://itt-core-stage.herokuapp.com/api/v2/prices/ETH?page=2",
    "previous": null,
    "results": [
      {
        "timestamp": "2018-03-29T10:52:58.887630",
        "source": 0,
        "counter_currency": 0,
        "transaction_currency": "ETH",
        "price": 5479978
      }
    ]
}*/
function parse_info(price_result) {

    const wiki_url = "https://coinmarketcap.com/currencies";

    return tickers.get()
        .then((tkrs) => {

            var currency_wiki;
            if (tkrs == undefined || tkrs.length <= 0) {
                currency_wiki = `*[${currency_wiki_data.symbol}](${wiki_url}})*`
            }
            else {
                var matching_tkrs = tkrs.filter(t => t.symbol == price_result.transaction_currency);
                var currency_wiki_data = matching_tkrs[0];

                if (currency_wiki_data == undefined) {
                    console.log(`Wiki not found for ${price_result.transaction_currency}!`);
                    currency_wiki_data.symbol = price_result.transaction_currency;
                    currency_wiki_data.name = '';
                    currency_wiki_data.rank = '?'
                }
                currency_wiki = `*${currency_wiki_data.name}, *[${currency_wiki_data.symbol}](${wiki_url}/${currency_wiki_data.name})*, Rank #${currency_wiki_data.rank}*`
            }

            var retrieved_price;
            var price_change_sign;

            if (price_result.counter_currency == 0) {
                retrieved_price = `${parseFloat(price_result['close_price'] / 100000000).toFixed(8)} BTC`;
            }
            else
                retrieved_price = `${Number(parseFloat(price_result['close_price'] / 100000000).toFixed(2))} USD`; //!It might be not correct

            if (price_result.price_change_24h > 0)
                price_change_sign = '▲';
            else if (price_result.price_change_24h < 0)
                price_change_sign = '🔻';
            else
                price_change_sign = '►';

            return `${currency_wiki}\nPrice: ${retrieved_price} (${(price_result.price_change_24h * 100).toFixed(2)}% ${price_change_sign})\nLast update: ${price_result.timestamp.split('.')[0]}\nSource: ${exchanges[price_result.source]}`;
        })
        .catch(reason => errorManager.handleException(reason));
}

var exchanges = ['Poloniex']
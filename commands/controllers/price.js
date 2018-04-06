var tickers = require('../data/tickers').tickers
var api = require('../../core/api')
require('../../util/extensions')
var nopreview_markdown_opts = require('../../bot/telegramInstance').nopreview_markdown_opts

var exchanges = ['Poloniex']

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id
        const ticker = params[0]
        getPrice(ticker).then((result) => {
            moduleBot.sendMessage(chat_id, result.toString(), nopreview_markdown_opts)
        }).catch(reason => {
            console.log(reason);
            moduleBot.sendMessage(chat_id, 'Please retry...')
        })
    }
}

var getPrice = (currency) => {
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
}
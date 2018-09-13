var tickers = require('../../data/tickers')
var api = require('../../core/api')
var _ = require('lodash')
require('../../util/extensions')
var nopreview_markdown_opts = require('../../bot/telegramInstance').nopreview_markdown_opts

var exchanges = ['Poloniex', 'Binance', 'Bittrex']
var counter_currencies = ['BTC', 'ETH', 'USDT', 'XMR']

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id
        const ticker = params[0]

        if (!ticker)
            moduleBot.sendMessage(chat_id, 'Please, provide a coin symbol! Example: /volume DOGE')
        else {

            return getVolume(ticker.toUpperCase()).then((result) => {
                moduleBot.sendMessage(chat_id, result.toString(), nopreview_markdown_opts)
            }).catch(reason => {
                console.log(reason);
                moduleBot.sendMessage(chat_id, 'Please retry...')
            })
        }
    }
}

var getVolume = (currency) => {
    return api.volume(currency)
        .then(json => {
            var info = JSON.parse(json)
            if ('results' in info && info.results.length > 0) {
                return parse_info(info.results[0]);
            } else {
                return tickers.get().then((tkrs) => {
                    return `Sorry, I can't find *${currency}*.\nTry BTC, ETH, XRP, BCH or other coins we support.`;
                })
            }
        })
}

function parse_info(volume_result) {

    const wiki_url = "https://coinmarketcap.com/currencies"

    if ('volume' in volume_result) {
        var retrievedVolume = parseFloat(volume_result['volume']).toFixed(3)

        return tickers.get()
            .then((tkrs) => {

                var currency_wiki;
                if (tkrs == undefined || tkrs.length <= 0) {
                    currency_wiki = `*[${currency_wiki_data.symbol}](${wiki_url}})*`
                }
                else {
                    var matching_tkrs = tkrs.filter(t => t.symbol == volume_result.transaction_currency);
                    var currency_wiki_data = matching_tkrs[0];

                    if (currency_wiki_data == undefined) {
                        console.log(`Wiki not found for ${volume_result.transaction_currency}!`);
                        currency_wiki_data.symbol = volume_result.transaction_currency;
                        currency_wiki_data.name = '';
                        currency_wiki_data.rank = '?'
                    }
                    
                    currency_wiki = `*${currency_wiki_data.name}, *[${currency_wiki_data.symbol}](${wiki_url}/${currency_wiki_data.name})*/${counter_currencies[volume_result.counter_currency]}, Rank #${currency_wiki_data.rank}*`
                }

                return `${currency_wiki}\n24h Volume: ${retrievedVolume} ${currency_wiki_data.symbol}\nLast update: ${volume_result.timestamp.split('.')[0]}`
            })
    }
}
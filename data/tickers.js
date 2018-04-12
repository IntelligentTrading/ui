var rp = require('request-promise')
var _ = require('lodash')
var api = require('../core/api')
var NodeCache = require('node-cache')
var cache = new NodeCache({ stdTTL: 6000, checkperiod: 6000 })

var tickers = {
    get: () => {

        var tickers = cache.get('tickers');
        if (tickers != undefined) {
            return new Promise((resolve, reject) => {
                resolve(tickers);
            });
        }

        return api.tickers()
            .then((json_tickers) => {
                if (json_tickers == undefined)
                    return [];

                var tickers = JSON.parse(json_tickers);
                cache.set('tickers', tickers);
                return tickers;
            })
            .catch((reason) => {
                console.log(reason)
            });
    },
    counter_currencies: () => {
        var counter_currencies = cache.get('counter_currencies');
        if (counter_currencies != undefined) return new Promise((resolve, reject) => resolve(counter_currencies));

        return api.counterCurrencies().then(json_ccs => {
            var ccs = JSON.parse(json_ccs);
            cache.set('counter_currencies', ccs);
            return ccs;
        });
    },
    init: () => {
        Promise.all([tickers.get(), tickers.counter_currencies()])
            .then(() => console.log('[Telegram bot] data initialized.'))
            .catch(reason => { console.log('[Telegram bot] data not initialized.') })
    }
}

console.log('[Telegram bot] initialize data...')
tickers.init()

module.exports = tickers
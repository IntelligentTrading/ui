var rp = require('request-promise')
var _ = require('lodash')
var api = require('../core/api')
/*var NodeCache = require('node-cache')
var cache = new NodeCache({ stdTTL: 6000, checkperiod: 6000 })*/

var tickers = {
    get: () => {

        /*var tickers = cache.get('tickers');
        if (tickers != undefined) {
            return new Promise((resolve, reject) => {
                resolve(tickers);
            });
        }
        console.log('Initialize tickers...')*/
        return api.tickers().then((json_tickers) => {
            if (json_tickers == undefined)
                return []

            var tickers = JSON.parse(json_tickers)
            //cache.set('tickers', tickers)
            //console.log('Tickers initialized.')
            return tickers
        })
    },
    counter_currencies: () => {
        /*var counter_currencies = cache.get('counter_currencies');
        if (counter_currencies != undefined) return new Promise((resolve, reject) => resolve(counter_currencies));
        console.log('Initialize counter currencies...')*/

        return api.counterCurrencies().then(json_ccs => {
            var ccs = JSON.parse(json_ccs)
            //cache.set('counter_currencies', ccs)
            //console.log('Counter currencies initialized.')
            return ccs
        })
    }/*,
    init: async () => {
        await tickers.get()
        await tickers.counter_currencies()
    }*/
}

//tickers.init().then(() => console.log('Tickers data initialized.'))
module.exports = tickers
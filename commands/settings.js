var api = require('../core/api').api
var errorManager = require('../util/error').errorManager
var eventEmitter = require('../events/botEmitter')
/*
var keyboards = [
    {
        label: 'MAIN',
        kb: kbs.main_keyboard
    },
    {
        label: 'RSK',
        kb: kbs.risk_keyboard
    },
    {
        label: 'HRZ',
        kb: kbs.trader_keyboard
    },
    {
        label: 'SIG',
        kb: kbs.base_currency_keyboard
    },
    {
        label: 'COI',
        kb: kbs.currencies_keyboard
    }];

var settings = {
    text: kbs.main_keyboard.message,
    getKeyboard: function (label = 'MAIN') {
        var kb = keyboards.filter(function (keyboard) {
            return keyboard.label == label;
        });

        if (kb.length > 0) {
            current_kb = kb[0].kb;
        }
        return current_kb;

        throw new Error('Keyboard not found');
    },
    getCurrentKeyboard: () => {
        return current_kb;
    },
    store: (chat_id, param) => {
        if (param != undefined) {
            let kv = param.split('_');

            if (kv[0] == 'HRZ')
                return update(chat_id, { horizon: kv[1] });
            if (kv[0] == 'RSK')
                return update(chat_id, { risk: kv[1] });
            if (kv[0] == 'ISMUTED')
                return update(chat_id, { is_muted: kv[1] == 'True' });
            if (kv[0] == 'CROWD')
                return update(chat_id, { is_crowd_enabled: kv[1] == 'True' });
            if (kv[0] == 'ISSUB')
                return update(chat_id, { is_subscribed: kv[1] == 'True' });
            if (kv[0] == 'SIG') {
                var counter_currency = { symbol: kv[1], index: kv[2], follow: kv[3] == 'True' };
                var counter_currencies = [];
                counter_currencies.push(counter_currency);
                return update(chat_id, { currencies: counter_currencies }, 'currencies/counter');
            }
            if (kv[0] == 'COI') {
                var currency = { symbol: kv[1], follow: kv[2] == 'True' };
                var transaction_currencies = [];
                transaction_currencies.push(currency);
                return update(chat_id, { currencies: transaction_currencies }, 'currencies/transaction');
            }
            else
                return errorManager.reject('Something went wrong, please retry or contact us!', 'Invalid callback_data key');
        }
    },
    profile: {},
    generateCodeForPlan: (plan) => api.generateToken(plan)
}

exports.settings = settings;

*/
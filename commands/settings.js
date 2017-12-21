
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var api = require('../core/api').api;
var errorManager = require('../util/error').errorManager;
var help = require('./help').help;
var kbs = require('./keyboards/keyboards').keyboards;

var current_kb = kbs.main_keyboard;


var updateSettingsOnCallback = (response_body) => {
    var user_object = JSON.parse(response_body);
    settings.profile = user_object.settings;
    //update all the kbs at once
    kbs.updateKeyboardsSettings(settings.profile);
}

var getUser = function (chat_id) {
    return api.updateUser(chat_id).then(response => {
        if (response.statusCode == 200) {
            updateSettingsOnCallback(response.body);
            return JSON.parse(response.body);
        }
        else {
            throw new Error(response.statusMessage);
        }
    })
        .catch((reason) => {
            console.log(reason);
            throw new Error(errorManager.genericErrorMessage);
        })
}

var update = function (chat_id, optionals, url_segment) {
    return api.updateUser(chat_id, optionals, url_segment)
        .then(response => {
            if (response.statusCode == 200) {
                updateSettingsOnCallback(response.body);
                return settings.profile;
            }
            else {
                throw new Error(response.statusMessage);
            }
        })
        .catch((reason) => {
            console.log(reason);
            throw new Error(errorManager.genericErrorMessage);
        })
}

var verify = (chat_id, token) => {
    return api.verifyUser(chat_id, token).then(response => {
        if (response.statusCode == 200) {
            updateSettingsOnCallback(response.body);
            return settings.profile;
        }
        else {
            throw new Error(response.statusMessage);
        }
    }).catch((reason) => {
        console.log(reason);
        throw new Error(errorManager.genericErrorMessage);
    })
}

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
            if (kv[0] == 'ISSUB')
                return update(chat_id, { is_subscribed: kv[1] == 'True' });
            if (kv[0] == 'SIG') {
                var counter_currency = { symbol: kv[1], index: kv[2], follow: kv[3] == 'True' };
                var counter_currencies = [];
                counter_currencies.push(counter_currency);
                return update(chat_id, { counter_currencies: counter_currencies }, 'counter_currencies');
            }
            if (kv[0] == 'COI') {
                var currency = { symbol: kv[1], follow: kv[2] == 'True' };
                var currencies_array = [];
                currencies_array.push(currency);
                return update(chat_id, { transaction_currencies: currencies_array }, 'transaction_currencies');
            }
            else
                return errorManager.reject('Something well wrong, please retry or contact us!', 'Invalid callback_data key');
        }
    },
    profile: {},
    getUser: (chat_id) => getUser(chat_id),
    subscribe: (chat_id, token) => verify(chat_id, token ),
    subscribedMessage: "Trading signals will automatically generate. This could take a few minutes. Please hold on. In the meanwhile, you can optimize your preferences by using the command: /settings",
    subscriptionError: "Something went wrong with the subscription, please retry or contact us!",
    tokenError: "Your token is invalid or already in use. Please use /token your_token, contact us or [join](https://goo.gl/forms/T7fFe38AM8mNRhDO2) the waiting list.",
    userNotSubscribed: "Please use /token your_token in order to get signals or set you preferences.",
}

exports.settings = settings;
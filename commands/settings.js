
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var storage = require('../db/storage').storage;
var errorManager = require('../util/error').error;

var main_keyboard = {
    message: '',
    buttons:
    [
        [{ text: "Edit Risk Profile", callback_data: "settings.NAV:RSK" }],
        [{ text: "Edit Trader Profile", callback_data: "settings.NAV:HRZ" }],
        [{ text: "Turn alerts", callback_data: "settings.DB:ISMUTED_" }]
    ]
}

var risk_keyboard = {
    message: "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.",
    buttons: [
        [{ text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_low" }],
        [{ text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_medium" }],
        [{ text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_high" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};

var trader_keyboard = {
    message: "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.",
    buttons: [
        [{ text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:HRZ_long" }],
        [{ text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:HRZ_medium" }],
        [{ text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:HRZ_short" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};

var post = function (chat_id, optionals) {
    return storage.settingsQuery(chat_id, optionals)
        .then(userProfile => settings.profile = JSON.parse(userProfile))
        .then(() => {

            var isMuted = settings.profile.is_muted;

            var msg = `Your profile is set on *${settings.profile.horizon}* horizon, *${settings.profile.risk}* risk.
You are ${settings.profile.is_subscribed ? '*subscribed*' : '*not subscribed*'} to signals and your notifications are ${settings.profile.is_muted ? '*muted*' : '*active*'}.
Tap below to edit your settings:`;

            main_keyboard.message = msg;

            main_keyboard.buttons[2][0].text = isMuted ? 'Turn alerts ON' : 'Turn alerts OFF';
            main_keyboard.buttons[2][0].callback_data = isMuted
                ? main_keyboard.buttons[2][0].callback_data.split('_')[0] + '_False'
                : main_keyboard.buttons[2][0].callback_data.split('_')[0] + '_True';
        });
}


var keyboards = [
    {
        label: 'MAIN',
        kb: main_keyboard
    },
    {
        label: 'RSK',
        kb: risk_keyboard
    },
    {
        label: 'HRZ',
        kb: trader_keyboard
    }];

var settings = {
    text: main_keyboard.message,
    getKeyboard: function (label = 'MAIN') {
        var kb = keyboards.filter(function (keyboard) {
            return keyboard.label == label;
        });

        if (kb.length > 0)
            return kb[0];

        throw new Error('Keyboard not found');
    },
    store: (chat_id, param) => {
        if (param != undefined) {
            let kv = param.split('_');

            if (kv[0] == 'HRZ')
                return post(chat_id, { horizon: kv[1] });
            if (kv[0] == 'RSK')
                return post(chat_id, { risk: kv[1] });
            if (kv[0] == 'ISMUTED')
                return post(chat_id, { is_muted: kv[1] });
            else
                return errorManager.reject('Something well wrong, please retry or contact us!', 'Invalid callback_data key');
        }
    },
    profile: {},
    getCurrent: (chat_id) => post(chat_id),
    subscribe: (chat_id) => post(chat_id, { is_subscribed: 'True', is_muted: 'False' }),
    unsubscribe: (chat_id) => post(chat_id, { is_subscribed: 'False', is_muted: 'True' }),
}

exports.settings = settings;
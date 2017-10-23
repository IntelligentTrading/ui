
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var storage = require('../db/storage').storage;

var main_keyboard = {
    message: "Manage your settings:\n\n",
    buttons:
    [
        [{ text: "Edit Risk Profile", callback_data: "settings.NAV:RSK" }],
        [{ text: "Edit Trader Profile", callback_data: "settings.NAV:HRZ" }]
    ]
}

var risk_keyboard = {
    message: "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.",
    buttons: [
        [{ text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_LOW" }],
        [{ text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_MED" }],
        [{ text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_HIGH" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};

var trader_keyboard = {
    message: "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.",
    buttons: [
        [{ text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:HRZ_LONG" }],
        [{ text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:HRZ_MED" }],
        [{ text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:HRZ_SHORT" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};


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
    options: {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": main_keyboard.buttons
        }
    },
    getKeyboard: function (label) {
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
                return storage.storeSettings(chat_id, { horizon: kv[1] });
            if (kv[0] == 'RSK')
                return storage.storeSettings(chat_id, { risk: kv[1] });
        }
    },
    subscribe: (chat_id) => storage.storeSettings(chat_id, { is_subscribed: true, is_muted: false }),
    unsubscribe: (chat_id) => storage.storeSettings(chat_id, { is_subscribed: false, is_muted: true }),
    mute: (chat_id) => storage.storeSettings(chat_id, { is_muted: true }),
}

exports.settings = settings;
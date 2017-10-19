
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var main_keyboard = {
    message: "Manage your settings:\n\n",
    buttons:
    [
        [{ text: "Edit Risk Profile", callback_data: "settings.NAV:RSK" }],
        [{ text: "Edit Trader Profile", callback_data: "settings.NAV:TRD" }]
    ]
}

var risk_keyboard = {
    message: "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.",
    buttons: [
        [{text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_BGN"}],
        [{text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_STD"}],
        [{text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_HIGH"}],
        [{text: "Cancel", callback_data: "settings.NAV:MAIN"}]
    ]
};

var trader_keyboard = {
    message: "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.",
    buttons: [
        [{text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:TRD_LOW"}],
        [{text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:TRD_MED"}],
        [{text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:TRD_HIGH"}],
        [{text: "Cancel", callback_data: "settings.NAV:MAIN"}]
    ]
};


var keyboards = [
    {
        label: 'MAIN',
        kb: main_keyboard
    },
    {
        label: 'RSK',
        kb : risk_keyboard
    },
    {
        label: 'TRD',
        kb : trader_keyboard
    }];

var settings = {
    text: main_keyboard.message,
    options: {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": main_keyboard.buttons
        }
    },
    getKeyboard : function (label){
        var kb = keyboards.filter(function(keyboard){
            return keyboard.label == label;
        });
    
        if(kb.length > 0)
            return kb[0];
    
        throw new Error('Keyboard not found');
    },
    store : function(chat_id, param){
        console.log(`[DB] Saving ${param} on database.`);
    }
}

exports.settings = settings;
var main_settings = {
    message: "Manage your settings",
    kb:
    [
        [{ text: "Edit Risk Profile", callback_data: "RSK" }],
        [{ text: "Edit Trader Profile", callback_data: "TRD" }]
    ]
}

var settings = {
    text: main_settings.message,
    options: {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": main_settings.kb
        }
    },
}

exports.settings = settings;
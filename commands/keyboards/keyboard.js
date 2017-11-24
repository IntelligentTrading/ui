var _ = require('lodash');

function Keyboard(message, buttons, extraButtons = null, showCancelButton = true) {
    this.message = message;
    this.buttons = buttons;
    this.extraButtons = extraButtons;
    this.showCancelButton = showCancelButton;
    this.cancelButton = [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }];
}

Keyboard.prototype.getButtons = function (keyboard_page) {
    return new Promise((resolve, reject) => {
        var kb_buttons = _.clone(this.buttons);
        if (this.showCancelButton)
            kb_buttons.push(this.cancelButton);
        resolve(kb_buttons);
    });
}

Keyboard.prototype.setSettings = (userSettings) => {
    // do something
}

exports.Keyboard = Keyboard;
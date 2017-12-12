var _ = require('lodash');

function Keyboard(message, buttons, extraButtons = null, showBackButton = true, showCloseButton = false) {
    this.message = message;
    this.buttons = buttons;
    this.extraButtons = extraButtons;
    this.showBackButton = showBackButton;
    this.showCloseButton = showCloseButton;
    this.backButton = [{ text: "Back", callback_data: "settings.NAV:MAIN" }];
    this.closeButton = [{ text: "Close", callback_data: "settings.CLOSE" }];
}

Keyboard.prototype.getButtons = function (keyboard_page) {
    return new Promise((resolve, reject) => {
        var kb_buttons = _.clone(this.buttons);
        if (this.showBackButton)
            kb_buttons.push(this.backButton);
        if (this.showCloseButton)
            kb_buttons.push(this.closeButton);
        resolve(kb_buttons);
    });
}

Keyboard.prototype.updateSettings = (userSettings) => {
    // do something
}

exports.Keyboard = Keyboard;
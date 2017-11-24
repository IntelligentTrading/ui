function Keyboard(message, buttons, extraButtons = null) {
    this.message = message;
    this.buttons = buttons;
    this.extraButtons = extraButtons;
}

Keyboard.prototype.getButtons = function (keyboard_page) {
    return new Promise((resolve,reject) => {
        resolve(this.buttons);
    });
}

Keyboard.prototype.setSettings = (userSettings) => {
    // do something
}

exports.Keyboard = Keyboard;
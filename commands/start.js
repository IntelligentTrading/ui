var help = require('./help').help;

var start = {
    eula_text: (chat_id) => `Hi! I'm the ITT Trading Bot. Before you activate your account you MUST accept the [EULA](https://t.me/iv?url=https%3A%2F%2Fitt-node-services.herokuapp.com%2Feula%3Fu%3D${chat_id}&rhash=69471435748184)`
}

exports.start = start;

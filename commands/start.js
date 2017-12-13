var help = require('./help').help;

var eula_endpoint = process.env.ITT_NODE_SERVICES.split('://')[1]

var start = {
    eula_text: (chat_id) => `Hi! I'm the ITT Trading Bot. Before you activate your account you MUST accept the [EULA](https://t.me/iv?url=https%3A%2F%2F${eula_endpoint}%2Feula%3Fu%3D${chat_id}&rhash=69471435748184)`
}

exports.start = start;

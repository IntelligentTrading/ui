var rp = require('request-promise');


module.exports.storeFeedback = (chat_id, user, msg) => {
    var request_opts = {
        uri: `${process.env.ITT_NODE_SERVICES}/api/feedback`,
        method: 'POST',
        body: { telegram_chat_id: chat_id, user: user, content: msg },
        json: true,
        headers: {
            'NSVC-API-KEY': process.env.NODE_SVC_API_KEY
        }
    }

    return rp(request_opts)
}
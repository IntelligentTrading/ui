var rp = require('request-promise');

var feedback = {
    storeFeedback: (chat_id, user, msg) => {
        var request_opts = {
            uri: `${process.env.ITT_NODE_SERVICES}/api/feedback`,
            resolveWithFullResponse: true,
            method: 'POST',
            body: { chat_id: chat_id, user: user, type: 'feedback', content: msg },
            json: true
        };

        return rp(request_opts);
    }
}

exports.feedback = feedback;
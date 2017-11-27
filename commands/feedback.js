var rp = require('request-promise');

var feedback = {
    storeFeedback: (chat_id, msg) => {
        var request_opts = {
            uri: `${process.env.ITT_NODE_SERVICES}/feedback`,
            resolveWithFullResponse: true,
            method: 'POST',
            body: { chat_id: chat_id, type: 'feedback', content: msg },
            json: true
        };

        return rp(request_opts);
    }
}

exports.feedback = feedback;
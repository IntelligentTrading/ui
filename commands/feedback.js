var rp = require('request-promise');

var feedback = {
    storeFeedback: (chat_id, user, msg) => {
        var request_opts = {
            uri: `${process.env.ITT_NODE_SERVICES}/api/feedback`,
            resolveWithFullResponse: true,
            method: 'POST',
            body: { chat_id: chat_id, user: user, type: 'feedback', content: msg },
            json: true,
            headers : {
                'NSVC-API-KEY': process.env.NODE_SVC_API_KEY
            }
        };

        return rp(request_opts);
    }
}

exports.feedback = feedback;
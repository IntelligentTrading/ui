var rp = require('request-promise');

var feedback = {
    storeFeedback: (chat_id, user, msg) => {
        var request_opts = {
            uri: `${process.env.ITT_NODE_SERVICES}/api/feedback`,
            resolveWithFullResponse: true,
            method: 'POST',
            body: { chat_id: chat_id, user: user, content: msg },
            json: true,
            headers: {
                'NSVC-API-KEY': process.env.NODE_SVC_API_KEY
            }
        };

        return rp(request_opts);
    },
    helpText: "Got any comments? We'd love to hear those! You can send us your thoughts by simply typing them behind the /feedback command. For example: /feedback More signals!",
    thanksText: (feedbackCode) => `Thanks! Your feedback has been sent to the team and will be reviewed shortly. (Feedback code: ${feedbackCode})`
}

exports.feedback = feedback;
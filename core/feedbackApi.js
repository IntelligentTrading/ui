var rpromise = require('request-promise');
var node_svc_api = `${process.env.ITT_NODE_SERVICES}/api`;
var node_svc_api_key = process.env.NODE_SVC_API_KEY;

var request_opts = {
    headers: {
        'NSVC-API-KEY': node_svc_api_key
    },
    json: true
}

module.exports.storeFeedback = (chat_id, user, msg) => {
    var request_opts = {
        uri: `${process.env.ITT_NODE_SERVICES}/api/feedback`,
        resolveWithFullResponse: true,
        method: 'POST',
        body: { chat_id: chat_id, user: user, content: msg },
        json: true,
        headers: {
            'NSVC-API-KEY': process.env.NODE_SVC_API_KEY
        }
    }

    return rp(request_opts);
}
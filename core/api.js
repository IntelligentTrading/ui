var request = require('request');
var rpromise = require('request-promise');

//! find a nice way to avoid this stuff all the time
var api_url = `https://${process.env.ITT_STAGE_API_HOST}`;

var api = {
    users: (filters) => {
        var request_opts = {
            uri: `${api_url}/users?${filters}`,
            resolveWithFullResponse: true
        };

        return rpromise(request_opts);
    },
    user: (chat_id,optionals) => {
        if (chat_id == null || chat_id == undefined) {
            throw new Error('Chat id cannot be null or undefined');
        }

        var postParameters = Object.assign({}, { chat_id: chat_id }, optionals);

        var request_opts = {
            method: 'POST',
            uri: `${api_url}/user`,
            form: postParameters,
            resolveWithFullResponse: true
        };

        return rpromise(request_opts);
    }
}

exports.api = api;
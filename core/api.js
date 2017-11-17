var request = require('request');
var rpromise = require('request-promise');

//! find a nice way to avoid this stuff all the time (ITT_STAGE_API_HOST)
var api_url = `https://${process.env.ITT_API_HOST}`;

var api = {
    users: (filters) => {
        var request_opts = {
            uri: `${api_url}/users?${filters}`,
            resolveWithFullResponse: true
        };

        //! returns the full response, with status code and body
        return rpromise(request_opts);
    },
    itt_members: () => {
        var request_opts = {
            uri: `${api_url}/users?is_ITT_team`,
        };

        //! returns the list already
        return rpromise(request_opts);
    },
    beta_users: () =>{
        var request_opts = {
            uri: `${api_url}/users?beta_token_valid`,
        };
        
        //! returns the list already
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
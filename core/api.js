var request = require('request');
var rpromise = require('request-promise');

var api_url = `https://${process.env.ITT_API_HOST}`;
var api_key = process.env.ITT_API_KEY;

function Options() {
    return {
        headers: {
            'API-KEY': api_key
        }
    }
}

var api = {
    users: (filters) => {

        var request_opts = new Options();
        request_opts.uri = `${api_url}/users?${filters}`;
        request_opts.resolveWithFullResponse = true;

        //! returns the full response, with status code and body
        return rpromise(request_opts);
    },
    itt_members: () => {

        var request_opts = new Options();
        request_opts.uri = `${api_url}/users?is_ITT_team=true`;

        //! returns the list already
        return rpromise(request_opts);
    },
    beta_users: () => {

        var request_opts = new Options();
        request_opts.uri = `${api_url}/users?beta_token_valid=true`;

        //! returns the list already
        return rpromise(request_opts);
    },
    user: (chat_id, optionals) => {
        if (chat_id == null || chat_id == undefined) {
            throw new Error('Chat id cannot be null or undefined');
        }

        var postParameters = Object.assign({}, { chat_id: chat_id }, optionals);

        var request_opts = new Options();
        request_opts.uri = `${api_url}/user`;
        request_opts.method = 'POST';
        request_opts.form = postParameters;
        request_opts.resolveWithFullResponse = true;

        return rpromise(request_opts);
    },
    price: (symbol) => {

        var request_opts = new Options();
        request_opts.url = `${api_url}/price?coin=${symbol}`;

        return rpromise(request_opts);
    }
}

exports.api = api;
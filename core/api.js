var request = require('request');
var rpromise = require('request-promise');

var api_version = 'v2'
var api_url = `https://${process.env.ITT_API_HOST}/${api_version}`;
var api_key = process.env.ITT_API_KEY;
var node_svc_api = `${process.env.ITT_NODE_SERVICES}/api`;
var node_svc_api_key = process.env.NODE_SVC_API_KEY;

function Options() {
    return {
        headers: {
            'NSVC-API-KEY': node_svc_api_key
        }
    }
}

var api = {
    createUser: (chat_id) => {
        var request_opts = new Options()
        request_opts.uri = `${node_svc_api}/users`
        request_opts.method = 'POST'
        request_opts.form = { telegram_chat_id: chat_id, eula: false }
        return rpromise(request_opts)
    },
    getUsers: (options = {}) => {

        var chat_id = options.telegram_chat_id == undefined ? '' : options.telegram_chat_id;
        var filters = chat_id != '' ? [] : options.filters; //filters won't work for single user selection 

        var stringified_filters = filters ? filters.join('&') : '';

        var request_opts = new Options()
        request_opts.uri = `${node_svc_api}/users/${chat_id}?${stringified_filters}`

        return rpromise(request_opts);
    },
    updateUser: (chat_id, settings, resource_url = '') => {
        if (chat_id == null || chat_id == undefined) {
            throw new Error('Chat id cannot be null or undefined');
        }

        var request_opts = new Options();
        request_opts.uri = `${node_svc_api}/users/${chat_id}/${resource_url}`
        request_opts.method = 'PUT'
        request_opts.form = settings

        return rpromise(request_opts);
    },
    subscribeUser: (chat_id, token) => {

        var request_opts = new Options();
        request_opts.method = 'POST';
        request_opts.uri = `${node_svc_api}/license/subscribe`
        request_opts.form = { telegram_chat_id: chat_id, licenseCode: token }
        return rpromise(request_opts);
    },
    itt_members: () => {

        var request_opts = new Options();
        request_opts.uri = `${node_svc_api}/users?is_ITT_team=true`;

        //! returns the list already
        return rpromise(request_opts);
    },
    price: (symbol) => {

        var request_opts = new Options();
        request_opts.url = `${api_url}/resampled-prices/${symbol}`
        request_opts.headers = {
            'API-KEY': api_key
        }
        return rpromise(request_opts);
    },
    volume: (symbol) => {

        var request_opts = new Options();
        request_opts.url = `${api_url}/volumes/${symbol}`
        request_opts.headers = {
            'API-KEY': api_key
        }
        return rpromise(request_opts);
    },
    tickers: () => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/tickers/transaction_currencies`;
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    },
    counterCurrencies: () => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/tickers/counter_currencies`;
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    },
    selectAllSignals: (chat_id) => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/users/${chat_id}/select_all_signals`;
        request_opts.method = 'PUT';
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    },
    getSignals: (signal) => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/signals/${signal}`;
        request_opts.method = 'GET';
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    },
    generateToken: (plan, admin_token) => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/license/generate/${plan}`;
        request_opts.method = 'POST';
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    },
    addFeedReaction: (feedId, reaction, chat_id) => {
        var request_opts = {
            uri: `${node_svc_api}/panic`,
            method: 'PUT',
            body: {
                feedId: feedId,
            },
            json: true,
            headers: {
                'NSVC-API-KEY': node_svc_api_key
            }
        }

        var ittReaction = '';

        switch (reaction.toUpperCase()) {
            case 'BULL': ittReaction = 'ittBullish'; break;
            case 'BEAR': ittReaction = 'ittBearish'; break;
            case 'IMP': ittReaction = 'ittImportant'; break;
        }

        request_opts.body[ittReaction] = [];
        request_opts.body[ittReaction].push(chat_id);

        return rpromise(request_opts);
    },
    getSubscriptionTemplate: (plan) => {
        var request_opts = {};
        request_opts.url = `${node_svc_api}/users/template/${plan}`;
        request_opts.headers = {
            'NSVC-API-KEY': node_svc_api_key
        }

        return rpromise(request_opts);
    }
}

module.exports = api
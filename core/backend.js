var rpromise = require('request-promise')
var core_api_version = 'v2'
var core_api_url = `https://${process.env.ITT_API_HOST}/${core_api_version}`
var core_api_key = process.env.ITT_API_KEY

module.exports = {
    get: (partial_url) => {
        if (partial_url[0] == '/') partial_url = partial_url.slice(1)

        var request_url = `${core_api_url}/${partial_url}`
        return rpromise(request_url, { headers: { 'API-KEY': core_api_key } })
    }
}
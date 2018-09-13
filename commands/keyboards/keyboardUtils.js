
module.exports = {
    getButtonCallbackData: (cmd, data, functon, navigation) => getButtonCallbackData(cmd, data, functon, navigation)
}

/**
 * 
 * @param {*} cmd The command you call with /<command>. This is a shortcut to execute the same actions.
 * @param {*} d The data to pass to for the command execution
 * @param {*} f The function to execute in the navigation, such as Back or Close
 * @param {*} n Navigation page to load after the callback
 */
function getButtonCallbackData(cmd, d, f, n) {
    var dataObject = { cmd: cmd }
    if (d && Object.keys(d).length > 0)
        dataObject.d = d
    if (f) dataObject.f = f
    if (n) dataObject.n = n

    var callbackData = JSON.stringify(dataObject).trim()
    if (callbackData.length > 64) {
        throw new Error('Button callback data string is too long')
    }

    return callbackData
}
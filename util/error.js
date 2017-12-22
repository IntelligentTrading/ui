//! Using this to avoid to write new Promise every time I need to handle a reject
//TODO Search for a better solution

var errorManager = {
    generic_error_message: 'Uh-Oh, something went wrong! Please retry...',
    communication_error_message: 'Communication error...',
    currency_error: 'Currency not found',
    settings_error: 'Something went wrong while saving your settings, please try again or contact us if the problem persists.',
    reject: (reason, err = null) => new Promise((resolve, reject) => {
        if (err != null)
            throw new Error(err);

        reject(reason);
    }),
    handleException: (err, reason = errorManager.generic_error_message) => {
        console.log(err);
        return reason;
    },
}


exports.errorManager = errorManager;
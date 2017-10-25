//! Using this to avoid to write new Promise every time I need to handle a reject
//TODO Search for a better solution

var error = {
    reject: (reason, err = null) => new Promise((resolve, reject) => {
        if (err != null)
            throw new Error(err);

        reject(reason);
    })
}


exports.error = error;
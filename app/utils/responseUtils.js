exports.success = ( res, message, data, status ) => {
    return res.status( status || 400 ).json({
        code: '00',
        message,
        data
    })
}

exports.error = ( res, message, status ) => {
    return res.status( status || 400 ).json({
        code: '99',
        message
    })
}

exports.serverError = ( res, error ) => {
    console.error('An Error Occurred: ', error );
    return res.status(500).json({ message: error.message });
}

module.exports = exports;
exports.success = ( res, status, message, data ) => {
    return res.status( status ).json({
        code: '00',
        message,
        data
    })
}

exports.error = ( res, status, message ) => {
    return res.status( status ).json({
        code: '99',
        message
    })
}

exports.serverError = ( res, error ) => {
    console.error('An Error Occurred: ', error );
    return res.status(500).json({ message: error.message });
}

module.exports = exports;
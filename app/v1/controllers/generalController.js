const generalService = require('../services/generalService');
// const dynamicUpdateService = require('../services/dynamicUpdateService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.getGeneralInfo = async ( req, res ) => {
    try {
        const result = await generalService.getGeneralInfo();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;
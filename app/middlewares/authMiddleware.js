const { verifyToken } = require('../utils/jwtUtils');
const { error, serverError } = require('../utils/responseUtils');

const authenticateUser = ( req, res, next ) => {
    const token = req.header('Authorization').split(' ')[1];
    if ( !token ) return message.error( res, 'Token Not Provided', 401 );

    try {
        const decoded = verifyToken(token);
        if ( !decoded ) return error( res, 'Invalid or Expired Token', 401 );
    
        req.user = decoded;
        next();            
    } catch ( err ) {
        return serverError( res, err );
    }
};

module.exports = { authenticateUser };
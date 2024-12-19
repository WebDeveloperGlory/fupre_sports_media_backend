const { verifyToken } = require('../utils/jwtUtils');
const message = require('../utils/responseUtils');

const authenticateUser = ( req, res, next ) => {
    const token = req.header('Authorization').split(' ')[1];
    if ( !token ) return message.error( res, 'Token Not Provided', 401 );

    try {
        const decoded = verifyToken(token);
        if ( !decoded ) return message.error( res, 'Invalid or Expired Token', 401 );
    
        req.user = decoded;
        next();            
    } catch ( err ) {
        return message.serverError( res, err )
    }
};

module.exports = authenticateUser;
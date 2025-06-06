const { verifyToken } = require('../utils/jwtUtils');
const { error, serverError } = require('../utils/responseUtils');

const authenticateUser = ( req, res, next ) => {
    const auth = req.header('Authorization');
    if( !auth ) return error( res, 'Login Required', 401 );
    const token = auth.split(' ')[1];
    if ( !token ) return error( res, 'Token Not Provided', 401 );

    try {
        const decoded = verifyToken(token);
        if ( !decoded ) return error( res, 'Invalid or Expired Token', 401 );
    
        req.user = decoded;
        global.currentUser = {
            ...decoded,
            _id: decoded.userId
        };
        next();            
    } catch ( err ) {
        return serverError( res, err );
    }
};

module.exports = { authenticateUser };
const db = require('../config/db');
const { error, serverError } = require('../utils/responseUtils');

const isSuperAdmin = ( req, res, next ) => {
    const { role } = req.user;

    try {
        if( role !== 'super-admin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

const isCompetitionAdmin = ( req, res, next ) => {
    const { role } = req.user;

    try {
        if( role !== 'competition-admin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

const hasTeamPermissions = async ( req, res, next ) => {
    const { userId, role } = req.user;
    const { teamId } = req.params;

    try {
        const document = await db.Team.findById( teamId );
        if( !document ) return error( res, 'Invalid Team' );
        if( !document.admin ) return error( res, 'Unassigned Admin' );
        if( !document.admin.equals( userId ) && role !== 'super-admin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

const hasCompetitionPermissions = async ( req, res, next ) => {
    const { userId, role } = req.user;
    const { competitionId } = req.params;

    try {
        const document = await db.Competition.findById( competitionId );
        if( !document ) return error( res, 'Invalid Competition' );
        if( !document.admin ) return error( res, 'Unassigned Admin' );
        if( !document.admin.equals( userId ) && role !== 'super-admin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

module.exports = { hasTeamPermissions, hasCompetitionPermissions, isSuperAdmin, isCompetitionAdmin };
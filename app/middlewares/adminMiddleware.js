const db = require('../config/db');
const { error, serverError } = require('../utils/responseUtils');

const authorize = ( roles ) => {
    return ( req, res, next ) => {
        try {
            if ( !roles.includes( req.user.role ) ) {
                return error( res, 'Access Denied', 403 );
            }
            next();
        } catch ( err ) {
            return serverError( res, err )
        }
    };
};

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

const hasPlayerPermissions = async ( req, res, next ) => {
    const { userId, role } = req.user;
    const { playerId } = req.params;

    try {
        const playerDocument = await db.Player.findById( playerId );
        if( !playerDocument ) return error( res, 'Invalid Player' );
        const teamDocument = await db.Team.findById( playerDocument.team );
        if( !teamDocument.admin ) return error( res, 'Unassigned Admin' );
        if( !teamDocument.admin.equals( userId ) && role !== 'super-admin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

const refactoredHasPlayerPermisions = async ( req, res, next ) => {
    const { userId, role } = req.user;
    const { playerId } = req.params;

    try {
        const playerDocument = await db.FootballPlayer.findById( playerId );
        if( !playerDocument ) return error( res, 'Invalid Player' );
        const teamDocument = await db.FootballTeam.findById( playerDocument.team );
        if( !teamDocument.admin ) return error( res, 'Unassigned Admin' );
        if( !teamDocument.admin.equals( userId ) && role !== 'superAdmin' ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err ) {
        return serverError( res, err )
    }
}

module.exports = { 
    hasTeamPermissions, hasCompetitionPermissions, hasPlayerPermissions, 
    isSuperAdmin, isCompetitionAdmin, 
    authorize,
    refactoredHasPlayerPermisions
};
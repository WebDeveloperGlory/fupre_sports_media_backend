import { NextFunction, Request, RequestHandler, Response } from 'express';
import { error, serverError } from '../../utils/general/responseUtils';
import { UserRole } from '../../types/user.enums';

export const isSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role !== UserRole.SUPER_ADMIN ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const isLiveFixtureAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role !== UserRole.LIVE_FIXTURE_ADMIN ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const isMediaAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role !== UserRole.MEDIA_ADMIN ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const isHeadMediaAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role !== UserRole.HEAD_MEDIA_ADMIN ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const hasLiveFixturePermissions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role === UserRole.SUPER_ADMIN || role === UserRole.LIVE_FIXTURE_ADMIN ) {
            next();
        } else {
            return error( res, 'Invalid User Permissions', 401 );
        }
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const hasRatingPermissions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role === UserRole.SUPER_ADMIN || role === UserRole.MEDIA_ADMIN || role === UserRole.HEAD_MEDIA_ADMIN ) {
            next();
        } else {
            return error( res, 'Invalid User Permissions', 401 );
        }
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const hasCommentaryPermissions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user!;
    
    try {
        console.log(role)
        if( role === UserRole.SUPER_ADMIN || role === UserRole.MEDIA_ADMIN || role === UserRole.HEAD_MEDIA_ADMIN || role === UserRole.LIVE_FIXTURE_ADMIN ) {
            next();
        } else {
            return error( res, 'Invalid User Permissions', 401 );
        }
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}
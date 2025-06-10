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
        if( role !== UserRole.SUPER_ADMIN ) return error( res, 'Invalid User Permissions', 401 );

        next();
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}
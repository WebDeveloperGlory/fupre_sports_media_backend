import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtUserPayload } from '../../utils/general/jwtUtils';
import { error, serverError } from '../../utils/general/responseUtils';

// Extend Express Request to include `user`
interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
}

export const authenticateUser = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const auth = req.header('Authorization') || req.cookies['authToken'];
    console.log({ cookies: req.cookies, auth })
    if ( !auth ) return error(res, 'Login Required', 401);

    const token = auth.split(' ')[1];
    if (!token) return error(res, 'Token Not Provided', 401);

    try {
        const decoded = verifyToken(token);
        if (!decoded) return error(res, 'Invalid or Expired Token', 401);

        req.user = decoded;

        next();
    } catch (err: any) {
        serverError(res, err);
        return;
    }
}

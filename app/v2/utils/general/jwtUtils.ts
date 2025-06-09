import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/env';
import { ObjectId } from 'mongoose';

const secretKey: string = config.JWT_SECRET;

/** Define what your JWT payload looks like */
export interface JwtUserPayload extends JwtPayload {
    userId: ObjectId;
    email: string;
    role: string;
}

/**
 * Generate a signed JWT token
 * @param user - Object containing _id, email, and role
 */
export const generateToken = ( user: { _id: ObjectId; email: string; role: string } ): string => {
    const { _id, email, role } = user;
    const maxAge = 24 * 60 * 60; // 1 day in seconds

    return jwt.sign(
        { userId: _id, email, role },
        secretKey,
        { expiresIn: maxAge }
    );
};

/**
 * Verify the token and return decoded payload or null
 * @param token - JWT token string
 */
export const verifyToken = ( token: string ): JwtUserPayload | null => {
    try {
        return jwt.verify(token, secretKey) as JwtUserPayload;
    } catch (err) {
        return null;
    }
};

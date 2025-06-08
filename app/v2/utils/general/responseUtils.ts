import { Response } from 'express';

export const success = (
    res: Response,
    message: string,
    data: any,
    status: number = 200
) => {
    return res.status(status).json({
        code: '00',
        message,
        data,
    });
};

export const error = (
    res: Response,
    message: string,
    status: number = 400
) => {
    return res.status(status).json({
        code: '99',
        message,
    });
};

export const serverError = (
    res: Response,
    error: Error
) => {
    console.error('An Error Occurred: ', error);
    return res.status(500).json({ message: error.message });
};

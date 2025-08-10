import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { config } from './env'; // adjust if env.ts is in a different path

const APP_PORT = config.PORT;

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const swaggerDefinitionV2 = deepCopy({
    openapi: '3.0.0',
    info: {
        title: 'University Sports Tracking API',
        version: '2.0.0',
        description: 'API documentation for University Sports Tracking system (v2)',
    },
    servers: [
        {
            url: `http://localhost:${APP_PORT}/api/v2`,
            description: 'General Local Development server (v2)',
        },
        {
            url: `http://localhost:${APP_PORT}`,
            description: 'V2 Local Development server (v2)',
        },
        {
            url: `https://fupre-sports-media-backend.onrender.com/api/v2`,
            description: 'Production server (v2)',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        responses: {
            UnauthorizedError: {
                description: 'Unauthorized access',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                    },
                },
            },
            NotFoundError: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                    },
                },
            },
            BadRequestError: {
                description: 'Bad request',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                    },
                },
            },
            ServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                    },
                },
            },
        },
        schemas: {
            SuccessResponse: {
                type: 'object',
                properties: {
                    code: { type: 'string', example: '00', description: 'Success code' },
                    message: { type: 'string', example: 'Operation successful' },
                    data: { type: 'object', additionalProperties: true },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    code: { type: 'string', example: '99', description: 'Error code' },
                    message: { type: 'string', example: 'An error occurred' },
                },
            },
        },
    },
});

const optionsV2: Options = {
    swaggerDefinition: swaggerDefinitionV2,
    apis: ['./app/v2/docs/*/*.ts'], // points to your TS doc annotations
};

export const swaggerSpecV2 = swaggerJsdoc(optionsV2);
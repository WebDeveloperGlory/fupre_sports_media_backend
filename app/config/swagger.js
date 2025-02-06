const swaggerJsdoc = require('swagger-jsdoc');
const { PORT } = require('./env');

const APP_PORT = PORT;

const swaggerDefinition = {
    openapi: '3.0.0', // Use OpenAPI version 3.0.0
    info: {
        title: 'University Sports Tracking API',
        version: '1.0.0',
        description: 'API documentation for University Sports Tracking system',
    },
    servers: [
        {
            url: `http://localhost:${ APP_PORT }/api`, // Server URL
            description: 'Local Development server',
        },
        {
            url: `https://fupre-sports-media-backend.onrender.com/api`, // Server URL
            description: 'Production server',
        },
    ],
    components: {
        // Reusable security schemes for authorization
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', // Indicates the token format
          },
        },
        // Reusable schemas for response models
        schemas: {
          SuccessResponse: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: '00', // Example value
                description: 'A code indicating the success of the operation.',
              },
              message: {
                type: 'string',
                example: 'Operation successful',
                description: 'A human-readable message explaining the success.',
              },
              data: {
                type: 'object',
                additionalProperties: true,
                description: 'An optional object containing additional data related to the operation.',
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: '99',
                description: 'A code indicating the failure of the operation.',
              },
              message: {
                type: 'string',
                example: 'An error occurred',
                description: 'A human-readable message explaining the error.',
              },
            },
          },
        },
    },
};

const options = {
  swaggerDefinition,
  apis: ['./app/routes/*.js'], // Path to your API route files
};

const swaggerSpec = swaggerJsdoc( options );

module.exports = swaggerSpec;
const swaggerJsdoc = require('swagger-jsdoc');
const { PORT } = require('./env');

const APP_PORT = PORT;

const swaggerDefinitionV1 = JSON.parse(JSON.stringify({
  openapi: '3.0.0',
  info: {
    title: 'University Sports Tracking API',
    version: '1.0.0',
    description: 'API documentation for University Sports Tracking system',
  },
  servers: [
    {
      url: `http://localhost:${APP_PORT}/api`,
      description: 'Local Development server',
    },
    {
      url: `https://fupre-sports-media-backend.onrender.com/api`,
      description: 'Production server',
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
}));

// const swaggerDefinitionV2 = JSON.parse(JSON.stringify(swaggerDefinitionV1)); // Deep clone
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
const swaggerDefinitionV2 = deepCopy(swaggerDefinitionV1);

swaggerDefinitionV2.info.version = '2.0.0';
swaggerDefinitionV2.servers = [
  {
    url: `http://localhost:${APP_PORT}/api/v2`,
    description: 'Local Development server (v2)',
  },
  {
    url: `https://fupre-sports-media-backend.onrender.com/api/v2`,
    description: 'Production server (v2)',
  },
];

const optionsV1 = {
  swaggerDefinition: swaggerDefinitionV1,
  apis: ['./app/routes/*.js'],
};

const optionsV2 = {
  swaggerDefinition: swaggerDefinitionV2,
  apis: ['./app/docs/*/*.js'],
};

const swaggerSpecV1 = swaggerJsdoc(optionsV1);
const swaggerSpecV2 = swaggerJsdoc(optionsV2);

module.exports = { swaggerSpecV1, swaggerSpecV2 };
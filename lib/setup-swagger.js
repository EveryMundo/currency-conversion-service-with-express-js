
const fastifySwagger = require('fastify-swagger');
const Package        = require('../package.json');
const { config }     = require('../config');

const setupSwagger = (fastify) => {
  fastify.register(fastifySwagger, {
    exposeRoute: true,
    swagger: {
      info: {
        title: `${Package.name} swagger`,
        description: 'testing the fastify swagger api',
        version: '0.1.0',
      },
      host: `0.0.0.0:${config.APP_PORT}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
      },
    },
  });

  return fastify;
};

module.exports = { setupSwagger };

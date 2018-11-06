const expressUiSwagger = require('swagger-ui-express');
const Package = require('../package.json');
const {config} = require('../config');

const setupSwagger = (express) => {
  const routes = {
    root:    require('../routes/root'),
    convert: require('../routes/convert'),
    info:    require('../routes/info'),
    healthcheck: require('../routes/healthcheck'),
  };
  const swaggerDocs = {
    exposeRoute: true,
    swagger: '2.0',
    info: {
      title: `${Package.name} swagger`,
      description: 'testing the express UI swagger api',
      version: '2.0',
    },
    host: `${config.APP_IP}:${config.APP_PORT}`,
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
    paths: {},
  };
  const paths = {};
  Object.keys(routes)
    .forEach((routeKey) => {
      const routeLib = routes[routeKey];
      Object.keys(routeLib)
        .forEach((keyMethod) => {
          const { method, schema } = routeLib[keyMethod];
          paths[routeKey] = {};
          paths[routeKey][method.toLowerCase()] = schema;
        });
    });
  swaggerDocs.paths = paths;
  express.use('/docs', expressUiSwagger.serve, expressUiSwagger.setup(swaggerDocs));
  return express;
};

module.exports = { setupSwagger };

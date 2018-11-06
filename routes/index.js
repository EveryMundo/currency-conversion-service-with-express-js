'use strict';

const assert = require('assert');
const logr   = require('em-logr').create({name: 'routes'});
// route structure created by loading the routes from the routes folder
const routes = {
  root:    require('./root'),
  convert: require('./convert'),
  info:    require('./info'),
  healthcheck: require('./healthcheck'),
};

const { getMajorVersionNumber } = require('@everymundo/generate-microservice-name');

const getPrefixFromPackageJSON = () => `/v${getMajorVersionNumber()}`;

const registerRoutes = async (express) => {
  const prefix = getPrefixFromPackageJSON();
  Object.keys(routes)
    .forEach((routeKey) => {
      const routeLib = routes[routeKey];

      Object.keys(routeLib)
        .forEach((keyMethod) => {
          const { url, method, beforeHandler, validations, handler} = routeLib[keyMethod];
          const regx = /^\//;
          assert(regx.test(url), `${routeKey} => INVALID PATH/URL [${url}] for route [${routeKey}] does not match ${regx}`);

          logr.debug(`Registering >${method.toLowerCase()} ${url}`);
          const valid = validations !== undefined ? validations : [];
          const handlers = beforeHandler !== undefined ? [beforeHandler, handler] : handler;
          express[method.toLowerCase()](`${prefix}${url}`, valid, handlers);
          if (express._router.stack.find(stack => stack.route && stack.route.path === `${prefix}${url}`)) {
            logr.debug(`${url} Registered successfully`);
          }
        });
    });

  return express;
};

// exporting in this way makes testing/stubbing easier
module.exports = {
  routes,
  registerRoutes,
  getPrefixFromPackageJSON,
};

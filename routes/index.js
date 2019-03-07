'use strict';

const assert = require('assert');
const logr   = require('em-logr').create({name: 'routes'});
const jwtAuthz = require('express-jwt-authz');
const {getCheckJwtMiddleware, respondWithUnauthorizedError} = require('./../lib/auth0');

// route structure created by loading the routes from the routes folder
const routes = {
  root:    require('./root'),
  convert: require('./convert'),
  info:    require('./info'),
  healthcheck: require('./healthcheck'),
};

/**
 * Default response for unsupported methods. Status 405
 */
const unsupportedResponse = (req, res) => {
  res.status(405).json({err: true, reason: 'Unsupported method'});
};
const expressUnexpectedError = (err, req, res, next) => {
  if (err) {
    logr.error(err);
    res.status(500);
    res.json({
      msg: 'Unexpected error' + err,
      request: req.body,
    });
  } else {
    next(err);
  }
};

const expressPageNotFound = (req, res) => {
  logr.error({status: 404, req});
  res.status(404);
  res.json({
    msg: 'Page not found',
    request: req.originalUrl,
  });
};

const registerRoutes = async (express) => {
  const httpMethods = [
    'checkout', 'copy', 'delete', 'get', 'head', 'lock',
    'merge', 'mkactivity', 'mkcol', 'move', 'm-search', 'notify',
    'options', 'patch', 'post', 'purge', 'put', 'report',
    'search', 'subscribe', 'trace', 'unlock', 'unsubscribe',
  ];
  Object.keys(routes)
    .forEach((routeKey) => {
      const routeLib = routes[routeKey];
      const supportedMethods = [];
      let path;
      Object.keys(routeLib)
        .forEach((keyMethod) => {
          const {url, method, beforeHandler, validations, handler} = routeLib[keyMethod];
          path = url;
          supportedMethods.push(method.toLowerCase());
          const regx = /^\//;
          assert(regx.test(url), `${routeKey} => INVALID PATH/URL [${url}] for route [${routeKey}] does not match ${regx}`);

          logr.debug(`Registering >${method.toLowerCase()} ${url}`);
          const valid = validations !== undefined ? validations : [];
          const handlers = beforeHandler !== undefined ? [beforeHandler, handler] : handler;
          if (!routeLib[keyMethod].authority) {
            express[method.toLowerCase()](url, valid, handlers);
          } else {
            const checkScopes = jwtAuthz(routeLib[keyMethod].authority);
            express[method.toLowerCase()](url, getCheckJwtMiddleware(), checkScopes, valid, handler);
          }
        });
      httpMethods.forEach((method) => {
        if (!supportedMethods.includes(method.toLowerCase())) {
          express[method.toLowerCase()](path, unsupportedResponse);
        }
      });
    });

  express.use(respondWithUnauthorizedError);
  express.use(expressUnexpectedError);
  express.use(expressPageNotFound);
  return express;
};

// exporting in this way makes testing/stubbing easier
module.exports = {
  routes,
  registerRoutes,
};

'use strict';

const assert = require('assert');
const logr   = require('em-logr').create({name: 'routes'});
const data   = require('../data');

const routes = {
  root: {
    path: '/',
    action(req, reply) {
      logr.info('req.query', req.query);
      reply.send(data);
    },
  },
  convert: require('./convert'),
};

const registerRoutes = async (fastify) => {
  // security: https://github.com/fastify/fastify-helmet
  fastify.register(require('fastify-helmet'));

  Object.keys(routes).forEach((route) => {
    const {path, options, action} = routes[route];
    const regx = /^\//;
    assert(regx.test(path), `INVALID PATH [${path}] for route [${route}] does not match ${regx}`);

    logr.debug(`registering ${path}`);
    fastify.get(path, options || {}, action);
  });

  return fastify;
};

// exporting in this way makes testing/stubbing easier
module.exports = {
  routes,
  registerRoutes,
};

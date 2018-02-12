'use strict';

const logr     = require('em-logr').create({ name: 'WORKER'});
const {run}    = require('./lib/runner');

const {setupSwagger}   = require('./lib/setup-swagger');
const {registerRoutes} = require('./routes/index');
const {
  listen,
  stopWorker,
  setProcessEvents,
} = require('./server-features');

const fastifyReady = (fastify) => {
  fastify.ready((err) => {
    if (err) throw err;
    fastify.swagger();

    logr.info('Alright!');
    logr.info(`server listening on ${fastify.server.address().port}`);
  });

  return fastify;
};

const dealWithErrors = (error) => {
  logr.error(error);
  stopWorker();
};

const init = () => {
  logr.debug('initializing fastify');
  const { fastify } = require('./lib/fastify-singleton');

  return setProcessEvents(fastify)
    .then(setupSwagger)
    .then(registerRoutes)
    .then(listen)
    .then(fastifyReady)
    .catch(dealWithErrors);
};

module.exports = {
  init,
  fastifyReady,
  dealWithErrors,
};

run(__filename, init);

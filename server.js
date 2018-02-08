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

const init = () => {
  logr.debug('initializing fastify');

  return setProcessEvents(require('./lib/fastify-singleton').fastify)
    .then(setupSwagger)
    .then(registerRoutes)
    .then(listen)
    .then((fastify) => {
      fastify.ready((err) => {
        if (err) throw err;
        fastify.swagger();

        logr.info('Alright!');
        logr.info(`server listening on ${fastify.server.address().port}`);
      });
    })
    .catch((error) => {
      logr.error(error);
      stopWorker();
    });
};

module.exports = {
  init,
};

run(__filename, init);

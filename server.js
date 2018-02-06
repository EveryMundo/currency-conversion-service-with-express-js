'use strict';

const logr     = require('em-logr').create({ name: 'WORKER'});
const {run}    = require('./lib/runner');

const {registerRoutes} = require('./routes/index');
const {
  listen,
  stopWorker,
  setProcessEvents,
} = require('./server-features');

const init = () => {
  logr.debug('initializing fastify');

  return setProcessEvents(require('./lib/fastify-singleton').fastify)
    .then(registerRoutes)
    .then(listen)
    .then((fastify) => {
      logr.info('Alright!');
      logr.info(`server listening on ${fastify.server.address().port}`);
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

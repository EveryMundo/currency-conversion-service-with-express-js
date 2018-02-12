'use strict';

const {config} = require('./config');
const logr     = require('em-logr').create({ name: 'WORKER'});

const listen = fastify => new Promise((resolve, reject) => {
  logr.debug(`listening to http://0.0.0.0:${config.APP_PORT}`);
  fastify.listen(config.APP_PORT, config.APP_IP, (err) => {
    logr.debug('listening to ', config.APP_PORT);

    if (err) {
      logr.error(err);
      return reject(err);
    }

    logr.info(`server listening on ${fastify.server.address().port}`);
    resolve(fastify);
  });
});

function stopWorker(fastify) {
  logr.error('stopping woker %s', process.pid);
  fastify.close(() => {
    logr.error('done %s', process.pid);
    process.exit(0);
  });
}

function setEventsFromMaster(fastify) {
  process.on('message', (message) => {
    logr.info('MESSAGE RECEIVED:', message.type || message);
    if (message.type === 'stop') {
      return stopWorker(fastify);
    }
  });
}

const setProcessEvents = async (fastify) => {
  process.on('SIGTERM', () => stopWorker(fastify));

  setEventsFromMaster(fastify);

  return fastify;
};

module.exports = {
  listen,
  stopWorker,
  setEventsFromMaster,
  setProcessEvents,
};

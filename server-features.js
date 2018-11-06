'use strict';

const logr     = require('em-logr').create({ name: 'WORKER'});
const {config} = require('./config');

const listen = express => new Promise((resolve, reject) => {
  logr.debug(`listening to http://0.0.0.0:${config.APP_PORT}`);
  express.listen(config.APP_PORT, (err) => {
    logr.debug('listening to ', config.APP_PORT);

    if (err) {
      logr.error(err);
      return reject(err);
    }
    // logr.info(`server listening on ${server.address().port}`);
    resolve(express);
  });
  return express;
});

const stopWorker = (server) => {
  logr.error('stopping woker %s', process.pid);
  if (server) {
    logr.error('done %s', process.pid);
    // server.close();
    process.exit(0);
  }
  return server;
};

const setEventsFromMaster = (server) => {
  process.on('message', (message) => {
    logr.info('MESSAGE RECEIVED:', message.type || message);
    if (message.type === 'stop') {
      return stopWorker(server);
    }
  });
};

const setProcessEvents = async (server) => {
  process.on('SIGTERM', () => stopWorker(server));

  setEventsFromMaster(server);

  return server;
};

module.exports = {
  listen,
  stopWorker,
  setEventsFromMaster,
  setProcessEvents,
};

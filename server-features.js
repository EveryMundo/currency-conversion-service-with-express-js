'use strict';

const {config} = require('./config');
const logr     = require('em-logr').create({ name: 'WORKER'});

const listen = express => new Promise((resolve, reject) => {
  try {
    logr.debug(`listening to http://0.0.0.0:${config.APP_PORT}`);
    express.listen(config.APP_PORT, config.APP_IP, (err) => {
      logr.debug('listening to ', config.APP_PORT);

      if (err) {
        console.log(err);
        logr.error(err);
        return reject(err);
      }

      // logr.info(`server listening on ${server.address().port}`);
      resolve(express);
    });
  } catch (error) {
    logr.error(error);
    reject(error);
  }
});

const stopWorker = (express) => {
  logr.error('stopping worker %s', process.pid);
  if (express) {
    logr.error('done %s', process.pid);
    process.exit(0);
  }

  return express;
};

const setEventsFromMaster = (express) => {
  process.on('message', (message) => {
    logr.info('MESSAGE RECEIVED:', message.type || message);
    if (message.type === 'stop') {
      return stopWorker(express);
    }
  });
  return express;
};

const setProcessEvents = async (express) => {
  process.on('SIGTERM', () => stopWorker(express));

  setEventsFromMaster(express);

  return express;
};

module.exports = {
  listen,
  stopWorker,
  setEventsFromMaster,
  setProcessEvents,
};

'use strict';

require('@everymundo/global-root-dir').setGlobalRootDir(__dirname);
const bodyparser              = require('body-parser');
const helmet                  = require('helmet');

const logr                    = require('em-logr').create({ name: 'WORKER'});
const { run }                 = require('@everymundo/runner');
const { setupSwagger }        = require('./lib/setup-swagger');
const { loadConfig }          = require('./lib/spring');
const { registerRoutes }      = require('./routes/index');

const { listen, stopWorker, setProcessEvents } = require('./server-features');

/**
 * Loads the middleware except request validator and its associated error handler
 * @param {require('express').app} express
 * @returns require('express').app
 */
const expressMiddleware = (express) => {
  express.use(bodyparser.json({limit: '250mb'}));
  express.use(helmet());

  return express;
};

const dealWithErrors = (express, error) => {
  if (error) {
    logr.error(error);
    stopWorker();
  }

  return express;
};

function loadServer() {
  return new Promise(async (resolve, reject) => {
    try {
      const { express } = require('./lib/express-singleton');
      await setProcessEvents(express);
      await expressMiddleware(express);
      const app = await registerRoutes(express);
      await setupSwagger(express);
      resolve(listen(app));
    } catch (error) {
      reject(error);
    }
  });
}

const init = () => {
  logr.debug('initializing express');
  const { express } = require('./lib/express-singleton');

  // const heapdump = require('heapdump');

  return loadConfig()
    // .then(() => {
    //   setInterval(() => {heapdump.writeSnapshot('/home/vince/Desktop/heapdumps/heapdump-' + Date.now() + '.heapsnapshot')},
    //     150000
    //   );
    // })
    .then(loadServer)
    .then(enforceGarbageCollection)
    .catch(dealWithErrors(express));
};


const enforceGarbageCollection = (express) => {
  setInterval(() => {
    logr.info('Garbage collecting');
    global.gc();
  }, 1800000);
  return express;
};

module.exports = {
  init,
  loadServer,
  dealWithErrors,
};

loadConfig()
  .then(() => {
    run(__filename, init);
  })
  .catch((error) => { throw error; });

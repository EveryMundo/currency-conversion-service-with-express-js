'use strict';

// https://nodejs.org/api/process.html#process_process_title

require('dotenv').config();

process.title = `app-master-${require('./package.json').version}`;
require('@everymundo/global-root-dir').setGlobalRootDir(__dirname);


const logr     = require('em-logr').create({name: '{MASTER}'});

const {
  forkAWorker,
  savePidFile,
  createWorkers,
  configClusterEvents,
  configKillSignals,
  configureTracer,
  registerToEureka,
  handleUnhandled,
} = require('./cluster-features');

const {loadConfig} = require('./lib/spring');

function initMaster(cluster) {
  handleUnhandled();
  savePidFile();
  createWorkers(cluster);
  configClusterEvents(cluster);
  configKillSignals(cluster);
  registerToEureka(cluster);
}

function initWorker() {
  handleUnhandled();
  logr.debug('loading server');
  const server = require('./server');

  logr.debug('initializing server');
  server.init();
}

function init(cluster) {
  if (cluster.isMaster) {
    logr.debug('Running cluster master');
    return initMaster(cluster);
  }

  logr.debug('Running cluster Worker');
  return initWorker();
}

module.exports = {
  forkAWorker,
  createWorkers,
  configKillSignals,
  configClusterEvents,
  registerToEureka,
  savePidFile,
  initMaster,
  initWorker,
  init,
};


// run(
//   __filename,
//   () => {
//     require('dotenv').config();
//     loadConfig()
//       .then(() => configureTracer())
//       .then(() => {
//         const {getEurekaClient} = require('./lib/eureka');
//         return getEurekaClient();
//       })
//       .catch((error) => {
//         logr.error(error);
//         throw error;
//       })
//       .then(() => initWorker())
//       .catch((error) => {
//         logr.error(error);
//         throw error;
//       })
//       .then()
//       .catch((error) => {
//         logr.error(error);
//         throw error;
//       });
//   }
// );

loadConfig()
  .then(() => configureTracer())
  .then(() => {
    const {getEurekaClient} = require('./lib/eureka');
    return getEurekaClient();
  })
  .then(() => initWorker())
  .then()
  .catch((error) => {
    logr.error(error);
    throw error;
  });

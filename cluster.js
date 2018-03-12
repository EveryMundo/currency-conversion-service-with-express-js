'use strict';

// https://nodejs.org/api/process.html#process_process_title
process.title = `app-master-${require('./package.json').version}`;

const logr     = require('em-logr').create({name: '{MASTER}'});
const { run }  = require('@everymundo/runner');
const { setGlobalRootDir } = require('./lib/set-global-root-dir');

const {
  forkAWorker,
  savePidFile,
  createWorkers,
  configClusterEvents,
  configKillSignals,
  registerToEureka,
} = require('./cluster-features');

function initMaster(cluster) {
  savePidFile();
  createWorkers(cluster);
  configClusterEvents(cluster);
  configKillSignals(cluster);
  registerToEureka(cluster);
}

function initWorker() {
  logr.debug('loading server');
  const server = require('./server');

  logr.debug('initializing server');
  server.init();
}

function init(cluster) {
  // Check this
  // https://github.com/isaacs/cluster-master/blob/master/cluster-master.js
  setGlobalRootDir();

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

run(__filename, init, require('cluster'));

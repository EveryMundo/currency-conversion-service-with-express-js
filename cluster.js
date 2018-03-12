'use strict';

// https://nodejs.org/api/process.html#process_process_title
process.title = `app-master-${require('./package.json').version}`;

const {config} = require('./config');
const logr     = require('em-logr').create({name: '{MASTER}'});
const { run }  = require('@everymundo/runner');
const { setGlobalRootDir } = require('./lib/set-global-root-dir');

function forkAWorker(cluster) {
  const worker = cluster.fork();
  worker.send({type: 'setWorkerId', workerId: worker.id});
}

function createWorkers(cluster) {
  const numCPUs = Math.abs(config.NUM_OF_WORKERS) || require('os').cpus().length;
  // const messageManager = {};
  // // Fork workers.
  // cluster.on('message', (worker, message) => {
  //   logr.debug('MESSAGE FROM Worker', message.type || message);
  //   if (message.type in messageManager) {
  //     return messageManager[message.type](message);
  //   }
  // });

  for (let i = 0; i < numCPUs; i++) {
    forkAWorker(cluster);
  }
}

function configKillSignals(cluster) {
  process.on('SIGUSR1', () => {
    const workerIds = Object.keys(cluster.workers);

    function killWorker(i) {
      if (!workerIds[i]) return;

      logr.info('sending message to worker %s %s', i);
      const worker = cluster.workers[workerIds[i]];
      if (worker.send) {
        worker.send({type: 'stop'});
      }

      setTimeout(killWorker, 200, i + 1);
    }

    killWorker(0);
  });
}

function configClusterEvents(cluster) {
  cluster.on('exit', (worker, code, signal) => {
    logr.error('worker %d died (%s). restarting...', worker.process.pid, signal || code);
    setTimeout(forkAWorker, 1000, cluster);
  });
}

const savePidFile = () => {
  require('fs').writeFileSync('./logs/cluster-master.pid', process.pid);
};

const registerToEureka = () => {
  const { asyncClientFromConfigService } = require('@everymundo/em-eureka');

  const {eureka} = config;
  const { port, securePort } = eureka.app;
  const eurekaCfg = { port, securePort };

  asyncClientFromConfigService(eurekaCfg)
    .then(() => {
      logr.info('eurekaCli connected');
    })
    .catch((err) => {
      logr.error(err);
    });
};

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
  savePidFile,
  initMaster,
  initWorker,
  init,
};

run(__filename, init, require('cluster'));

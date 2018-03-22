'use strict';

// https://nodejs.org/api/process.html#process_process_title
process.title = `app-master-${require('./package.json').version}`;

const {config} = require('./config');
const logr     = require('em-logr').create({name: '{MASTER}'});

function forkAWorker(cluster) {
  const worker = cluster.fork();
  worker.send({type: 'setWorkerId', workerId: worker.id});
}

function createWorkers(cluster) {
  // const messageManager = {};
  // // Fork workers.
  // cluster.on('message', (worker, message) => {
  //   logr.debug('MESSAGE FROM Worker', message.type || message);
  //   if (message.type in messageManager) {
  //     return messageManager[message.type](message);
  //   }
  // });

  for (let i = 0; i < config.NUM_OF_WORKERS; i++) {
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
  cluster.on('SIGHUP', (worker, code, signal) => {
    logr.error('worker %d died (%s). restarting...', worker.process.pid, signal || code);
    setTimeout(forkAWorker, 1000, cluster);
  });
}

const savePidFile = () => {
  require('fs').writeFileSync('./logs/cluster-master.pid', process.pid);
};

const registerToEureka = () => {
  const { asyncClientFromConfigService } = require('@everymundo/em-eureka');

  const { eureka } = config;

  const { servicePath } = eureka;
  const { port, securePort } = eureka.app;
  const eurekaCfg = { port, securePort, eureka: { servicePath }};

  return asyncClientFromConfigService(eurekaCfg)
    .then((eurekaCli) => {
      logr.info(`eurekaCli connected = ${eurekaCli.config.status}`, JSON.stringify(eurekaCli.config, null, 2));
    })
    .catch((err) => {
      logr.error(err);
      throw err;
    });
};

module.exports = {
  forkAWorker,
  createWorkers,
  configKillSignals,
  configClusterEvents,
  registerToEureka,
  savePidFile,
};


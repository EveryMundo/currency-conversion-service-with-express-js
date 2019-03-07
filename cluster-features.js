'use strict';

// https://nodejs.org/api/process.html#process_process_title
process.title = `app-master-${require('./package.json').version}`;

const ddTracer = require('dd-trace');

const { getMajorVersionNumber } = require('@everymundo/generate-microservice-name');

const {config} = require('./config');

const logr     = require('em-logr').create({name: '{MASTER}'});

function forkAWorker(cluster) {
  const worker = cluster.fork();
  worker.send({type: 'setWorkerId', workerId: worker.id});
}

function createWorkers(cluster) {
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
  const { getEurekaClient } = require('./lib/eureka');
  return getEurekaClient()
    .then()
    .catch((error) => { throw error; });
};

const handleUnhandled = (cluster) => {
  process.on('unhandledRejection', (err, p) => {
    logr.error('An Unhandled Rejection occurred in promise ', p);
    logr.error(err);
    setTimeout(forkAWorker, 1000, cluster);
  });
};

const configureTracer = () => {
  const tracer = ddTracer.init({
    service: `${require('./package.json').name}-v${getMajorVersionNumber()}`,
    plugins: false,
    tags: {platform: 'nodejs'},
  });
  tracer.use('express');
  return tracer;
};

module.exports = {
  forkAWorker,
  createWorkers,
  configKillSignals,
  configClusterEvents,
  configureTracer,
  registerToEureka,
  savePidFile,
  handleUnhandled,
};

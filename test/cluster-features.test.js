'require strict';

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai');
  // cleanrequire = require('@everymundo/cleanrequire'),
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('cluster-features.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let box;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  const server = require('../cluster-features');

  context('on load', () => {
    it('should export expected functions', () => {
      expect(server.forkAWorker).to.be.instanceof(Function);
      expect(server.createWorkers).to.be.instanceof(Function);
      expect(server.configKillSignals).to.be.instanceof(Function);
      expect(server.configClusterEvents).to.be.instanceof(Function);
      expect(server.savePidFile).to.be.instanceof(Function);
      expect(server.registerToEureka).to.be.instanceof(Function);
    });
  });

  describe('forkAWorker', () => {
    const { forkAWorker } = server;

    it('should call cluster.fork', () => {
      const cluster = {fork: sinon.spy(() => ({send: () => {}, id: 100}))};

      forkAWorker(cluster);
      expect(cluster.fork).to.have.property('calledOnce', true);
    });

    it('should call worker.send', () => {
      const send = sinon.spy((obj) => {
        expect(obj).to.have.property('type', 'setWorkerId');
        expect(obj).to.have.property('workerId', 100);
      });

      const cluster = {fork: sinon.spy(() => ({send, id: 100}))};

      forkAWorker(cluster);
      expect(cluster.fork).to.have.property('calledOnce', true);
      expect(send).to.have.property('calledOnce', true);
    });
  });

  describe('createWorkers', () => {
    const { createWorkers } = server;
    const os = require('os');
    const { config } = require('../config');

    beforeEach(() => {
      box.stub(os, 'cpus').callsFake(() => ({length: 2}));
    });

    context('when NUM_OF_WORKERS is set', () => {
      beforeEach(() => {
        box.stub(config, 'NUM_OF_WORKERS').value(1);
      });

      it('should not call os.cpus()', () => {
        const send = sinon.spy((obj) => {
          expect(obj).to.have.property('type', 'setWorkerId');
          expect(obj).to.have.property('workerId', 100);
        });

        const cluster = {
          on:   sinon.spy((msg, cb) => cb()),
          fork: sinon.spy(() => ({ send, id: 100 })),
        };

        createWorkers(cluster);

        expect(os.cpus).to.have.property('calledOnce', false);
        expect(cluster.fork).to.have.property('calledOnce', true);
        expect(send).to.have.property('calledOnce', true);
      });
    });
  });

  describe('configKillSignals', () => {
    const { configKillSignals } = server;

    beforeEach(() => {
      box.stub(process, 'on').callsFake((msg, cb) => cb());
    });

    it('should call process.on', (done) => {
      const send = sinon.spy((obj) => {
        expect(obj).to.have.property('type', 'stop');
        done();
      });

      const cluster = {
        workers: { 1: {}, 2: { send }},
      };

      configKillSignals(cluster);

      expect(process.on).to.have.property('calledOnce', true);
    });
  });

  describe('configClusterEvents', () => {
    const { configClusterEvents } = server;
    const worker = {process:{pid: 1}};
    const code   = 0;
    const signal = 'SIGNAL';

    let clock;
    beforeEach(() => { clock = sinon.useFakeTimers(); });

    afterEach(() => { clock.restore(); });

    context('with signal', () => {
      it('should call cluster.on', () => {
        const send = sinon.spy((obj) => {
          expect(obj).to.have.property('type', 'stop');
        });

        const cluster = {
          workers: { 1: {}, 2: { send } },
          on: sinon.spy((msg, cb) => cb(worker, code, signal)),
        };

        configClusterEvents(cluster);

        expect(cluster.on).to.have.property('calledOnce', true);
      });
    });

    context('WITHOUT signal', () => {
      it('should call cluster.on', () => {
        const send = sinon.spy((obj) => {
          expect(obj).to.have.property('type', 'stop');
        });

        const cluster = {
          workers: { 1: {}, 2: { send } },
          on: sinon.spy((msg, cb) => cb(worker, code)),
        };

        configClusterEvents(cluster);

        expect(cluster.on).to.have.property('calledOnce', true);
      });
    });
  });

  describe('savePidFile', () => {
    const fs = require('fs');

    beforeEach(() => {
      box.stub(fs, 'writeFileSync').callsFake(() => {});
    });

    it('should call fs.writeFileSync', () => {
      const { savePidFile } = server;
      savePidFile();
      expect(fs.writeFileSync).to.have.property('calledOnce', true);
    });
  });

  describe('registerToEureka', () => {
    const emEurekaLib = require('@everymundo/em-eureka');

    let calledWithArgs;

    context('When asyncClientFromConfigService resolves', () => {
      beforeEach(() => {
        calledWithArgs = undefined;
        box.stub(emEurekaLib, 'asyncClientFromConfigService')
          .callsFake(args => new Promise((resolve) => { calledWithArgs = args; resolve({config:{status:'connected'}}); }));
      });

      it('should call asyncClientFromConfigService and resolve', () => {
        const { registerToEureka } = server;

        return registerToEureka().then(() => {
          expect(emEurekaLib.asyncClientFromConfigService).to.have.property('calledOnce', true);
          expect(calledWithArgs).to.have.property('port');
          expect(calledWithArgs).to.have.property('securePort');
        });
      });
    });

    context('When asyncClientFromConfigService rejects', () => {
      const error = new Error('asyncClientFromConfigService error');

      beforeEach(() => {
        calledWithArgs = undefined;
        box.stub(emEurekaLib, 'asyncClientFromConfigService')
          .callsFake(args => new Promise((_, reject) => { calledWithArgs = args; reject(error); }));
      });

      it('should call asyncClientFromConfigService and REJECT', () => {
        const { registerToEureka } = server;

        return registerToEureka().catch(() => {
          expect(emEurekaLib.asyncClientFromConfigService).to.have.property('calledOnce', true);
          expect(calledWithArgs).to.have.property('port');
          expect(calledWithArgs).to.have.property('securePort');
        });
      });
    });
  });
});

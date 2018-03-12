'require strict';

require('./test-setup.js');

const
  cleanrequire = require('@everymundo/cleanrequire'),
  sinon    = require('sinon'),
  {expect} = require('chai');
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('cluster.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let box;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.sandbox.create();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  const server = require('../cluster');

  context('on load', () => {
    it('should export expected functions', () => {
      expect(server.initMaster).to.be.instanceof(Function);
      expect(server.initWorker).to.be.instanceof(Function);
      expect(server.init).to.be.instanceof(Function);
    });
  });

  describe('initMaster', () => {
    const clusterFeaturesLib = require('../cluster-features');
    const clusterFeaturesFunctionNames = [
      'savePidFile',
      'createWorkers',
      'configClusterEvents',
      'configKillSignals',
      'registerToEureka',
    ];

    let result;

    beforeEach(() => {
      result = [];
      clusterFeaturesFunctionNames.forEach(func =>
        box.stub(clusterFeaturesLib, func).callsFake(() => { result.push(func); }));
    });

    it('should call cluster features functions in order passing the cluster arg', () => {
      const { initMaster } = cleanrequire('../cluster');
      const cluster = {};
      initMaster(cluster);

      expect(result).to.deep.equal(clusterFeaturesFunctionNames);

      [
        'createWorkers',
        'configClusterEvents',
        'configKillSignals',
        'registerToEureka',
      ].forEach(func =>
        expect(clusterFeaturesLib[func].calledWith(cluster))
          .to.equal(true, `${func} did not receive correct cluster argument`));
    });
  });

  describe('initWorker', () => {
    const worker = require('../server');
    const { initWorker } = require('../cluster');

    beforeEach(() => {
      box.stub(worker, 'init').callsFake(() => { });
    });

    it('should call worker.init()', () => {
      initWorker();
      expect(worker.init).to.have.property('calledOnce', true);
    });
  });

  describe('init', () => {
    context('cluster.isMaster is TRUE', () => {
      const clusterFeaturesLib = require('../cluster-features');
      const clusterFeaturesFunctionNames = [
        'savePidFile',
        'createWorkers',
        'configClusterEvents',
        'configKillSignals',
        'registerToEureka',
      ];

      let result;

      beforeEach(() => {
        result = [];
        clusterFeaturesFunctionNames.forEach(func =>
          box.stub(clusterFeaturesLib, func).callsFake(() => { result.push(func); }));
      });

      it('should call initMaster', () => {
        const { init } = cleanrequire('../cluster');
        init({ isMaster: true });

        expect(result).to.deep.equal(clusterFeaturesFunctionNames);
      });
    });

    context('cluster.isMaster is FALSE', () => {
      const worker = require('../server');
      const { init } = require('../cluster');

      beforeEach(() => {
        box.stub(worker, 'init').callsFake(() => { });
      });

      it('should call initWorker()', () => {
        init({isMaster: false});
        expect(worker.init).to.have.property('calledOnce', true);
      });
    });
  });
});

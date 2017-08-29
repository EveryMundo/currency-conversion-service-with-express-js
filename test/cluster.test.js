'require strict';

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai');
  // cleanrequire = require('./cleanrequire'),
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('cluster.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let sandbox;
  beforeEach(() => {
    // creates sinon sandbox
    sandbox = sinon.sandbox.create();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { sandbox.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { sandbox.restore(); });

  context('on load', () => {
    it('should export expected functions', () => {
      const server = require('../cluster');
      expect(server.forkAWorker).to.be.instanceof(Function);
      expect(server.createWorkers).to.be.instanceof(Function);
      expect(server.configKillSignals).to.be.instanceof(Function);
      expect(server.configClusterEvents).to.be.instanceof(Function);
      expect(server.savePidFile).to.be.instanceof(Function);
      expect(server.initMaster).to.be.instanceof(Function);
      expect(server.initWorker).to.be.instanceof(Function);
      expect(server.init).to.be.instanceof(Function);
    });
  });

  describe('forkAWorker', () => {
    it('should test its functionality');
  });
  describe('createWorkers', () => {
    it('should test its functionality');
  });
  describe('configKillSignals', () => {
    it('should test its functionality');
  });
  describe('configClusterEvents', () => {
    it('should test its functionality');
  });
  describe('savePidFile', () => {
    it('should test its functionality');
  });
  describe('initMaster', () => {
    it('should test its functionality');
  });
  describe('initWorker', () => {
    it('should test its functionality');
  });
  describe('init', () => {
    it('should test its functionality');
  });
});

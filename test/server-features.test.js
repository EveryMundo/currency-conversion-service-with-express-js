'require strict';

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai');
  // cleanrequire = require('@everymundo/cleanrequire'),
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('server-features.js', () => {
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
      const
        expectedFunctions = [
          'listen',
          'stopWorker',
          'setEventsFromMaster',
          'setProcessEvents',
        ],
        server = require('../server-features');

      expectedFunctions.forEach((funcName) => {
        expect(server[funcName], funcName).to.be.instanceof(Function);
      });
    });
  });
  describe('listen', () => {
    it('should test its functionality');
  });
  describe('stopWorker', () => {
    it('should test its functionality');
  });
  describe('setEventsFromMaster', () => {
    it('should test its functionality');
  });
  describe('setProcessEvents', () => {
    it('should test its functionality');
  });
  describe('init', () => {
    it('should test its functionality');
  });
});

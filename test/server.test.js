'require strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon        = require('sinon'),
  {expect}     = require('chai'),
  cleanrequire = require('./cleanrequire');

describe('server.js', () => {
  const
    dataFile = require('../data/index'),
    logr = require('em-logr'),
    noop = () => {};

  let box;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.sandbox.create();

    sinon.useFakeTimers();
    box.stub(dataFile, 'update').callsFake(noop);
    box.stub(logr, 'create').callsFake(() => logr);
    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  context('on load', () => {
    it('should export expected functions', () => {
      const server = require('../server');
      expect(server.init).to.be.instanceof(Function);
    });
  });

  describe('init', () => {
    let
      setProcessEvents,
      registerRoutes,
      listen,
      stopWorker,
      results;

    const sf = require('../server-features');
    const rr = require('../routes');
    const singFast = require('../lib/fastify-singleton');

    before(() => {
      results = [];

      setProcessEvents    = sinon.spy(async () => results.push('setProcessEvents'));
      registerRoutes      = sinon.spy(async () => results.push('registerRoutes'));
      listen              = sinon.spy(async () => results.push('listen'));
      stopWorker          = sinon.spy(async () => results.push('stopWorker'));

      box.stub(sf, 'setProcessEvents').callsFake(setProcessEvents);
      box.stub(rr, 'registerRoutes').callsFake(registerRoutes);
      box.stub(sf, 'listen').callsFake(listen);
      box.stub(sf, 'stopWorker').callsFake(stopWorker);

      box.stub(singFast, 'fastify').value({

      });
    });

    it('call all the features functions in order', () => {
      const spies = {
        setProcessEvents,
        registerRoutes,
        listen,
        stopWorker,
      };
      const exp = Object.keys(spies);

      const {init} = cleanrequire('../server');
      return init()
        .then(() => {
          expect(results).deep.equal(exp);

          expect(setProcessEvents).to.have.property('calledOnce', true);
          expect(listen).to.have.property('calledOnce', true);
          expect(stopWorker).to.have.property('calledOnce', true);
          expect(setProcessEvents).to.have.property('calledOnce', true);
        });
    });
  });
});

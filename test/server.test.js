'require strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon        = require('sinon'),
  {expect}     = require('chai'),
  cleanrequire = require('./cleanrequire');

describe('server.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let sandbox;
  beforeEach(() => {
    // creates sinon sandbox
    sandbox = sinon.sandbox.create();

    sandbox.stub(logr, 'create').callsFake(() => logr);
    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { sandbox.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { sandbox.restore(); });

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

      sandbox.stub(sf, 'setProcessEvents').callsFake(setProcessEvents);
      sandbox.stub(rr, 'registerRoutes').callsFake(registerRoutes);
      sandbox.stub(sf, 'listen').callsFake(listen);
      sandbox.stub(sf, 'stopWorker').callsFake(stopWorker);

      sandbox.stub(singFast, 'fastify').value({

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

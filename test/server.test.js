'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon        = require('sinon'),
  {expect}     = require('chai'),
  cleanrequire = require('@everymundo/cleanrequire');

describe('server.js', () => {
  const
    testFile = '../server.js',
    logr = cleanrequire('em-logr'),
    noop = () => {};

  let box;
  let clock;

  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    clock = sinon.useFakeTimers();
    box.stub(logr, 'create').callsFake(() => logr);
    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => {
    clock.restore();
    box.restore();
    sinon.restore();
  });

  context('on load', () => {
    it('should export expected functions', () => {
      const server = cleanrequire(testFile);
      expect(server.init).to.be.instanceof(Function);
    });
  });

  describe('init', () => {
    let listen;
    let expressMiddleware;
    let dealWithErrors;
    let setProcessEvents;
    let setupSwagger;
    let registerRoutes;
    let stopWorker;
    let results;
    let box;

    before(() => {
      const sf = cleanrequire('../server-features');
      const rr = cleanrequire('../routes');
      const ss = cleanrequire('../lib/setup-swagger');
      const expressSingleton = cleanrequire('../lib/express-singleton');
      box = sinon.createSandbox();

      results = [];
      expressMiddleware   = sinon.spy(async () => results.push('expressMiddleware'));
      dealWithErrors      = sinon.spy(async () => results.push('dealWithErrors'));
      setProcessEvents    = sinon.spy(async () => results.push('setProcessEvents'));
      setupSwagger        = sinon.spy(async () => results.push('setupSwagger'));
      registerRoutes      = sinon.spy(async () => results.push('registerRoutes'));
      listen              = sinon.spy(async () => results.push('listen'));

      box.stub(cleanrequire('../lib/spring'), 'loadConfig').resolves({
        auth0: {
          issuer: 'fakeissuer',
          audience: 'fakeaudience',
        },
      });
      box.stub(cleanrequire('../lib/spring'), 'config').value({
        auth0: {
          issuer: 'fakeissuer',
          audience: 'fakeaudience',
        },
      });
      box.stub(sf, 'listen').callsFake(listen);
      box.stub(sf, 'setProcessEvents').callsFake(setProcessEvents);
      box.stub(rr, 'registerRoutes').callsFake(registerRoutes);
      box.stub(sf, 'stopWorker').callsFake(stopWorker);
      box.stub(ss, 'setupSwagger').callsFake(setupSwagger);
      box.stub(expressSingleton, 'express').value({
        use: () => {},
      });
    });

    it('call all the features functions in order', async () => {
      const {loadServer} = cleanrequire(testFile);
      await loadServer();
      expect(listen).to.have.property('calledOnce', true);
      expect(setProcessEvents).to.have.property('calledOnce', true);
      expect(registerRoutes).to.have.property('calledOnce', true);
      expect(setupSwagger).to.have.property('calledOnce', true);
    });
  });
});

'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai');
  // cleanrequire = require('@everymundo/cleanrequire'),
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe.skip('server-features.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let box;
  let express;

  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });

    express = {
      server: {address:() => ({port: 1000})},
      register: (() => {}),
      route: (() => {}),
    };
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  context('on load', () => {
    it('should export expected functions', () => {
      const expectedFunctions = [
        'listen',
        'stopWorker',
        'setEventsFromMaster',
        'setProcessEvents',
      ]
      const server = require('../server-features');

      expectedFunctions.forEach((funcName) => {
        expect(server[funcName], funcName).to.be.instanceof(Function);
      });
    });
  });

  describe.skip('#listen', () => {
    const { listen } = require('../server-features');
    context('sucess', () => {
      beforeEach(() => {
        express.listen = sinon.spy((port, ip, cb) => cb());
      });

      it('should call express.listen', () => listen(express).then(() => {
        expect(express.listen).to.have.property('calledOnce', true);
      }));

      it('should resolve with the same express input', () => listen(express).then((f) => {
        expect(f).to.equal(express);
      }));
    });

    context('error', () => {
      const expectedError = new Error('test Error');

      beforeEach(() => {
        express.listen = sinon.spy((port, ip, cb) => cb(expectedError));
      });

      it('should call express.listen', () => listen(express)
        .catch(() => {
          expect(express.listen).to.have.property('calledOnce', true);
        })
        .then((result) => {
          expect(result).to.be.undefined;
        }));

      it('should reject with the expected error object', () => listen(express)
        .catch((rejectionError) => {
          expect(rejectionError).to.equal(expectedError);
        })
        .then((result) => {
          expect(result).to.be.undefined;
        }));
    });
  });

  describe.skip('#stopWorker', () => {
    const { stopWorker } = require('../server-features');
    context('stop express exists', () => {
      beforeEach(() => {
        box.stub(process, 'exit').callsFake(() => {});
        express.close = sinon.spy(cb => cb());
      });

      it('should call process.exit', () => {
        stopWorker(express);
        expect(process.exit).to.have.property('calledOnce', true);
      });

      it('should return express', () => {
        const res = stopWorker(express);
        expect(res).to.equal(express);
      });
    });

    context('express.close DOES NOT exist', () => {
      it('should return express', () => {
        const res = stopWorker(express);
        expect(res).to.be.undefined;
      });
    });
  });

  describe('#setEventsFromMaster', () => {
    const { setEventsFromMaster } = require('../server-features');
    context('express.close exists', () => {
      let fakeMessage;

      beforeEach(() => {
        fakeMessage = {};
        box.stub(process, 'on').callsFake((msg, cb) => cb(fakeMessage));
        express.close = sinon.spy(() => {});
      });

      it('should call process.on with message', () => {
        setEventsFromMaster(express);
        expect(process.on).to.have.property('calledOnce', true);
        expect(process.on.calledWith('message')).to.be.true;
      });

      it.skip('should call express.close', () => {
        fakeMessage = { type: 'stop' };
        setEventsFromMaster(express);
        expect(express.close).to.have.property('calledOnce', true);
      });
    });
  });

  describe('#setProcessEvents', () => {
    const { setProcessEvents } = require('../server-features');
    context('express.close exists', () => {
      let fakeMessage;

      beforeEach(() => {
        fakeMessage = {};
        box.stub(process, 'on').callsFake((msg, cb) => cb(fakeMessage));
        express.close = sinon.spy(() => { });
      });

      it('should call process.on with message', () => setProcessEvents(express)
        .then(() => {
          expect(process.on).to.have.property('calledTwice', true);
          expect(process.on.calledWith('message')).to.be.true;
        }));

      it('should call process.on with SIGTERM', () => setProcessEvents(express)
        .then(() => {
          expect(process.on).to.have.property('calledTwice', true);
          expect(process.on.calledWith('SIGTERM')).to.be.true;
        }));

      it('should return express', () => setProcessEvents(express)
        .then((res) => {
          expect(res).to.equal(express);
        }));
    });
  });

  describe('$registerRoutes', () => {
    const {registerRoutes} = require('../routes/index');

    it('should register routes', (done) => {
      registerRoutes(express);
      done();
    });
  });

  describe('$setupSwagger', () => {
    const {setupSwagger} = require('../lib/setup-swagger');

    it('should register routes', (done) => {
      setupSwagger(express);
      done();
    });
  });
});

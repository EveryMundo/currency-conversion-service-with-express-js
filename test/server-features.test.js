'require strict';

/* eslint-disable no-unused-expressions */

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

  let box;
  let fastify;

  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });

    fastify = {
      server: {address:() => ({port: 1000})},
    };
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

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

  describe('#listen', () => {
    const { listen } = require('../server-features');
    context('sucess', () => {
      beforeEach(() => {
        fastify.listen = sinon.spy((port, ip, cb) => cb());
      });

      it('should call fastify.listen', () => listen(fastify).then(() => {
        expect(fastify.listen).to.have.property('calledOnce', true);
      }));

      it('should resolve with the same fastify input', () => listen(fastify).then((f) => {
        expect(f).to.equal(fastify);
      }));
    });

    context('error', () => {
      const expectedError = new Error('test Error');

      beforeEach(() => {
        fastify.listen = sinon.spy((port, ip, cb) => cb(expectedError));
      });

      it('should call fastify.listen', () => listen(fastify)
        .catch(() => {
          expect(fastify.listen).to.have.property('calledOnce', true);
        })
        .then((result) => {
          expect(result).to.be.undefined;
        }));

      it('should reject with the expected error object', () => listen(fastify)
        .catch((rejectionError) => {
          expect(rejectionError).to.equal(expectedError);
        })
        .then((result) => {
          expect(result).to.be.undefined;
        }));
    });
  });

  describe('#stopWorker', () => {
    const { stopWorker } = require('../server-features');
    context('fastify.close exists', () => {
      beforeEach(() => {
        box.stub(process, 'exit').callsFake(() => {});
        fastify.close = sinon.spy(cb => cb());
      });

      it('should call fastify.close', () => {
        stopWorker(fastify);
        expect(fastify.close).to.have.property('calledOnce', true);
      });

      it('should call process.exit', () => {
        stopWorker(fastify);
        expect(process.exit).to.have.property('calledOnce', true);
      });

      it('should return fastify', () => {
        const res = stopWorker(fastify);
        expect(res).to.equal(fastify);
      });
    });

    context('fastify.close DOES NOT exist', () => {
      it('should return fastify', () => {
        const res = stopWorker(fastify);
        expect(res).to.be.undefined;
      });
    });
  });

  describe('#setEventsFromMaster', () => {
    const { setEventsFromMaster } = require('../server-features');
    context('fastify.close exists', () => {
      let fakeMessage;

      beforeEach(() => {
        fakeMessage = {};
        box.stub(process, 'on').callsFake((msg, cb) => cb(fakeMessage));
        fastify.close = sinon.spy(() => {});
      });

      it('should call process.on with message', () => {
        setEventsFromMaster(fastify);
        expect(process.on).to.have.property('calledOnce', true);
        expect(process.on.calledWith('message')).to.be.true;
      });

      it('should call fastify.close', () => {
        fakeMessage = { type: 'stop' };
        setEventsFromMaster(fastify);
        expect(fastify.close).to.have.property('calledOnce', true);
      });
    });
  });

  describe('#setProcessEvents', () => {
    const { setProcessEvents } = require('../server-features');
    context('fastify.close exists', () => {
      let fakeMessage;

      beforeEach(() => {
        fakeMessage = {};
        box.stub(process, 'on').callsFake((msg, cb) => cb(fakeMessage));
        fastify.close = sinon.spy(() => { });
      });

      it('should call process.on with message', () => setProcessEvents(fastify)
        .then(() => {
          expect(process.on).to.have.property('calledTwice', true);
          expect(process.on.calledWith('message')).to.be.true;
        }));

      it('should call process.on with SIGTERM', () => setProcessEvents(fastify)
        .then(() => {
          expect(process.on).to.have.property('calledTwice', true);
          expect(process.on.calledWith('SIGTERM')).to.be.true;
        }));

      it('should return fastify', () => setProcessEvents(fastify)
        .then((res) => {
          expect(res).to.equal(fastify);
        }));
    });
  });
});

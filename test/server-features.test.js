'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai'),
  cleanrequire = require('@everymundo/cleanrequire');
// clone    = arg => JSON.parse(JSON.stringify(arg));

describe('server-features.js', () => {
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
    box.stub(process, 'exit').callsFake(() => {});
    box.stub(process, 'on').callsFake((msg, cb) => cb({}));
    express = {
      server: {address:() => ({port: 1000})},
      listen: (arg1, arg2, cb) => {
        cb();
        return {
          on: () => {},
          address: () => { return {port: 1234}; },
        };
      },
    };
    box.stub(require('../lib/spring'), 'loadConfig').resolves({auth0: {issuer: 'testissuer', audience: 'testaudience'}});
    box.stub(require('../lib/spring'), 'config').value({auth0: {issuer: 'testissuer', audience: 'testaudience'}});
  });

  // retores the sandbox
  afterEach(() => {
    sinon.restore();
    box.restore();
  });

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
    context('success', () => {

      it('should call express.listen', (done) => {
        const { listen } = cleanrequire('../server-features');
        express = {
          server: {address:() => ({port: 1000})},
          listen: (arg1, arg2, cb) => {
            cb();
            return {
              on: () => {},
              address: () => ({port: 1234}),
            };
          },
        };
        listen(express)
          .then(() => {
            done();
          })
          .catch((error) => {
            done(error);
          });
      });

      it('should resolve with the same express input', (done) => {
        const { listen } = cleanrequire('../server-features');
        express = {
          server: {address:() => ({port: 1000})},
          listen: (arg1, arg2, cb) => {
            cb();
            return {
              on: () => {},
              address: () => ({port: 1234}),
            };
          },
        };
        listen(express)
          .then((f) => {
            expect(f).to.equal(express);
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('error', () => {
      const expectedError = new Error('test Error');

      beforeEach(() => {
        express.listen = sinon.spy((port) => {return {on: () => {}}});
      });

      it.skip('should call express.listen', () => listen(express)
        .catch(() => {
          expect(express.listen).to.have.property('calledOnce', true);
        })
        .then((result) => {
          expect(result).to.be.undefined;
        }));

      it.skip('should reject with the expected error object', () => listen(express)
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
    context('express.close exists', () => {
      beforeEach(() => {
        process.exit();
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
  });

  describe('#setEventsFromMaster', () => {
    const sf = require('../server-features');
    const { setEventsFromMaster } = sf;
    context.skip('server.close exists', () => {
      let fakeMessage;

      beforeEach(() => {
        box = sinon.createSandbox();
        fakeMessage = {};
        box.stub(sf, 'server').value({
          on: () => {},
          close: () => {},
        });
        server.close = sinon.spy(() => {});
      });

      afterEach(() => { box.restore(); });

      it('should call process.on with message', () => {
        setEventsFromMaster(express);
        expect(process.on).to.have.property('calledOnce', true);
        expect(process.on.calledWith('message')).to.be.true;
      });
    });
  });

  describe('#setProcessEvents', () => {
    const serverFeatures = cleanrequire('../server-features');
    const { setProcessEvents } = serverFeatures;
    context('express.close exists', () => {
      // let fakeMessage;

      it('should call process.on with message', () => setProcessEvents(express)
        .then(() => {
          expect(process.on).to.have.property('calledTwice', true);
          expect(process.on.calledWith('message')).to.be.true;
        }));

      // it('should call process.on with SIGTERM', () => setProcessEvents(express)
      //   .then(() => {
      //     expect(process.on).to.have.property('calledTwice', true);
      //     expect(process.on.calledWith('SIGTERM')).to.be.true;
      //   }));

      it('should return express', () => setProcessEvents(express)
        .then((res) => {
          expect(res).to.equal(express);
        }));
    });
  });
});

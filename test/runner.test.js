'require strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon    = require('sinon'),
  {expect} = require('chai');

describe('runner.js', () => {
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

  context('#run()', () => {
    context('when filename is NOT the second arg', () => {
      beforeEach(() => {
        sandbox.stub(process, 'argv').value([null, 'this is not a file name']);
      });

      it('should not run the function', () => {
        const {run} = require('../lib/runner');
        const callback = sinon.spy(noop);
        run(__filename, callback);

        expect(callback.called).to.be.false;
      });
    });

    context('when filename is the second arg', () => {
      beforeEach(() => {
        sandbox.stub(process, 'argv').value([null, __filename]);
      });

      it('should not run the function', () => {
        const {run} = require('../lib/runner');
        const callback = sinon.spy(noop);
        run(__filename, callback);

        expect(callback.calledOnce).to.be.true;
      });
    });
  });
});

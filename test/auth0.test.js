const cleanRequire = require('@everymundo/cleanrequire');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(require('chai-string'));
const sinon = require('sinon');
const logr = require('em-logr');

const {expect} = chai;

describe('#auth0.js', () => {
  const noop = () => {};
  let box;

  context('#getCheckJwtMiddleware', () => {
    beforeEach(() => {
      box = sinon.createSandbox();
      sinon.useFakeTimers();
      box.stub(logr, 'create').callsFake(() => logr);
      // stubs the logr to stop logging during tests
      ['debug', 'info', 'warn', 'error', 'fatal']
        .forEach((level) => { box.stub(logr, level).callsFake(noop); });
      box.stub(require('../lib/spring'), 'loadConfig').resolves({auth0: {issuer: 'testissuer', audience: 'testaudience'}});
      box.stub(require('../lib/spring'), 'config').value({auth0: {issuer: 'testissuer', audience: 'testaudience'}});
    });

    afterEach(() => {
      box.restore();
    });

    it('should retrieve jwt middleware', (done) => {
      const spring = require('../lib/spring');
      spring.loadConfig().then(() => {
        const {getCheckJwtMiddleware} = cleanRequire('../lib/auth0');

        const middleware = getCheckJwtMiddleware();
        expect((typeof middleware)).to.equal('function');
        done();
      })
        .catch((err) => done(err));
    });
  });

  context('#respondWithUnauthorizedError', () => {
    const {Reply} = cleanRequire('./fixtures/reply');
    const {respondWithUnauthorizedError} = cleanRequire('../lib/auth0');
    let reply, box;

    beforeEach(() => {
      box = sinon.createSandbox();
      sinon.useFakeTimers();
      box.stub(logr, 'create').callsFake(() => logr);
      // stubs the logr to stop logging during tests
      ['debug', 'info', 'warn', 'error', 'fatal']
        .forEach((level) => { box.stub(logr, level).callsFake(noop); });
      reply = new Reply();
    });

    afterEach(() => {
      box.restore();
    });

    it('should respond with a 401 -- case when no credentials are provided', () => {
      const error = new Error('TestError');
      error.code = 'credentials_required';
      const next = sinon.spy();
      respondWithUnauthorizedError(error, {}, reply, next);
      expect(next.getCall(0)).to.be.null;
      expect(reply).to.have.property('statusCode', 401);
      expect(reply).to.have.property('body');
      expect(reply.body).to.have.property('message', 'TestError');
    });

    it('should response with a 403 -- case when credentials are incorrect', () => {
      const error = new Error('UnauthorizedError');
      error.name = 'UnauthorizedError';
      const next = sinon.spy();
      respondWithUnauthorizedError(error, {}, reply, next);
      expect(next.getCall(0)).to.be.null;
      expect(reply).to.have.property('statusCode', 403);
      expect(reply).to.have.property('body');
      expect(reply.body).to.have.property('message', 'Please check your authentication and try again.');
    });

    it('should "next()" for unrelated errors', () => {
      const error = new Error('TestError');
      const next = sinon.spy();
      respondWithUnauthorizedError(error, {}, reply, next);
      expect(next.getCall(0)).to.not.be.null;
      expect(next.calledWith(error)).to.be.true;
    });
  });
});

describe('#jwt.js', () => {
  // Only included for coverage reports
  context('jwt wrapper', () => {
    it('should be a function', () => {
      const {jwt} = cleanRequire('../lib/jwt');
      expect((typeof jwt)).to.equal('function');
    })
  });
});


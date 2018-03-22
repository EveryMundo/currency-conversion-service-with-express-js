'require strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon        = require('sinon'),
  {expect}     = require('chai'),
  cleanrequire = require('@everymundo/cleanrequire');

describe('fastify.server.js', () => {
  const
    { getMajorVersionNumber } = require('@everymundo/generate-microservice-name'),
    testFile = '../server.js',
    dataFile = require('../data/index'),
    logr = require('em-logr'),
    noop = () => {};

  let box;

  const sf = require('../server-features');
  const prefixedV = `v${getMajorVersionNumber()}`;

  let fastify;

  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.sandbox.create();

    sinon.useFakeTimers();
    box.stub(dataFile, 'update').callsFake(noop);
    box.stub(logr, 'create').callsFake(() => logr);
    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });

    box.stub(sf, 'setProcessEvents').callsFake(sinon.spy(async (f) => { fastify = f; return f; }));
  });

  // retores the sandbox
  afterEach((done) => {
    box.restore();
    if (fastify) return fastify.close(done);

    done();
  });

  context(`get /${prefixedV}`, () => {
    it('should export expected functions', () => {
      const { data } = cleanrequire('../data');
      const server = cleanrequire(testFile);

      server.init().then((fasty) => {
        fasty.inject({ method: 'GET', url: `/${prefixedV}/` }, (err, response) => {
          expect(err).to.be.null;
          expect(response).to.have.property('statusCode', 200);
          expect(response.headers).to.have.property('content-type', 'application/json');

          const responseData = JSON.parse(response.payload);

          expect(responseData).to.deep.equal(data);
        });
      });
    });
  });

  context(`get /${prefixedV}/info`, () => {
    it('should export expected functions', () => {
      const server = cleanrequire(testFile);

      server.init().then((fasty) => {
        fasty.inject({method: 'GET', url: `/${prefixedV}/info`}, (err, response) => {
          expect(err).to.be.null;
          expect(response).to.have.property('statusCode', 200);
          expect(response.headers).to.have.property('content-type', 'application/json');

          const responseData = JSON.parse(response.payload);

          const keys = Object.keys(responseData);
          expect(keys).to.deep.equal(['app', 'loadedAt']);

          expect(responseData.loadedAt).to.match(/^\d{4}-\d{2}-\d{2}/);

          const appKeys = Object.keys(responseData.app);
          expect(appKeys).to.deep.equal(['name', 'version']);

          const {name, version} = require('../package.json');

          expect(responseData.app.name).to.equal(name);
          expect(responseData.app.version).to.equal(version);
        });
      });
    });
  });

  context(`get /${prefixedV}/healthcheck`, () => {
    it('should export expected functions', () => {
      const server = cleanrequire(testFile);

      server.init().then((fasty) => {
        fasty.inject({ method: 'GET', url: `/${prefixedV}/healthcheck` }, (err, response) => {
          expect(err).to.be.null;
          expect(response).to.have.property('statusCode', 200);
          expect(response.headers).to.have.property('content-type', 'application/json');

          const responseData = JSON.parse(response.payload);
          const expected = {healthy: true, pid: process.pid};

          expect(responseData).to.deep.equal(expected);
        });
      });
    });
  });

  context(`get /${prefixedV}/convert`, () => {
    context('valid request', () => {
      const url = `/${prefixedV}/convert?value=1000&from=EUR&to=USD`;

      it('should export expected functions', () => {
        cleanrequire('../data');
        const server = cleanrequire(testFile);
        server.init().then((fasty) => {
          fasty.inject({method: 'GET', url}, (err, response) => {
            expect(err).to.be.null;
            expect(response).to.have.property('statusCode', 200);
            expect(response.headers).to.have.property('content-type', 'application/json');

            const responseData = JSON.parse(response.payload);
            const expected = {
              fixed: '1199.47',
              from:  'EUR',
              result: 1199.4707934859139,
              to:     'USD',
              value:   1000,
            };

            expect(responseData).to.deep.equal(expected);
          });
        });
      });
    });

    context('INVALID request', () => {
      context('missing *from* argument', () => {
        const url = `/${prefixedV}/convert?value=1000&to=USD`;
        it(`requesting ${url} should fail`, () => {
          cleanrequire('../data');
          const server = cleanrequire(testFile);
          server.init().then((fasty) => {
            fasty.inject({ method: 'GET', url }, (err, response) => {
              expect(err).to.be.null;
              expect(response).to.have.property('statusCode', 500);
              expect(response.headers).to.have.property('content-type', 'application/json');

              const responseData = JSON.parse(response.payload);
              const expected = {
                error: 'Internal Server Error',
                message: 'Unkown currency code [UNDEFINED] in from',
                statusCode: 500,
              };

              expect(responseData).to.deep.equal(expected);
            });
          });
        });
      });

      context('missing *to* argument', () => {
        const url = `/${prefixedV}/convert?value=1000&from=USD`;
        it(`requesting ${url} should fail`, () => {
          cleanrequire('../data');
          const server = cleanrequire(testFile);
          server.init().then((fasty) => {
            fasty.inject({ method: 'GET', url }, (err, response) => {
              expect(err).to.be.null;
              expect(response).to.have.property('statusCode', 500);
              expect(response.headers).to.have.property('content-type', 'application/json');

              const responseData = JSON.parse(response.payload);
              const expected = {
                error: 'Internal Server Error',
                message: 'Unkown currency code [UNDEFINED] in to',
                statusCode: 500,
              };

              expect(responseData).to.deep.equal(expected);
            });
          });
        });
      });

      context('missing *value* argument', () => {
        const url = `/${prefixedV}/convert?from=EUR&to=USD`;
        it(`requesting ${url} should fail`, () => {
          cleanrequire('../data');
          const server = cleanrequire(testFile);
          server.init().then((fasty) => {
            fasty.inject({ method: 'GET', url }, (err, response) => {
              expect(err).to.be.null;
              expect(response).to.have.property('statusCode', 500);
              expect(response.headers).to.have.property('content-type', 'application/json');

              const responseData = JSON.parse(response.payload);
              const expected = {
                error: 'Internal Server Error',
                message: 'Invalid value [NaN]',
                statusCode: 500,
              };

              expect(responseData).to.deep.equal(expected);
            });
          });
        });
      });
    });
  });

  context('get /convert/:expr', () => {
    context('valid request', () => {
      const url = `/${prefixedV}/convert/1000-from-EUR-to-USD`;

      it('should export expected functions', () => {
        cleanrequire('../data');
        const server = cleanrequire(testFile);
        server.init().then((fasty) => {
          fasty.inject({method: 'GET', url}, (err, response) => {
            expect(err).to.be.null;
            expect(response).to.have.property('statusCode', 200);
            expect(response.headers).to.have.property('content-type', 'application/json');

            const responseData = JSON.parse(response.payload);
            const expected = {
              fixed: '1199.47',
              from:  'EUR',
              result: 1199.4707934859139,
              to:     'USD',
              value:   1000,
            };

            expect(responseData).to.deep.equal(expected);
          });
        });
      });
    });

    context('INVALID request', () => {
      const url = `/${prefixedV}/convert/something-that-does-not-match`;
      it(`requesting ${url} should fail`, () => {
        cleanrequire('../data');
        const server = cleanrequire(testFile);
        server.init().then((fasty) => {
          fasty.inject({ method: 'GET', url }, (err, response) => {
            expect(err).to.be.null;
            expect(response).to.have.property('statusCode', 500);
            expect(response.headers).to.have.property('content-type', 'application/json');

            const responseData = JSON.parse(response.payload);
            const expected = {
              error: 'Internal Server Error',
              message: 'Invalid expression \'something-that-does-not-match\'',
              statusCode: 500,
            };

            expect(responseData).to.deep.equal(expected);
          });
        });
      });
    });
  });
});

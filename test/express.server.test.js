'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon = require('sinon'),
  request = require('supertest'),
  cleanrequire = require('@everymundo/cleanrequire');

describe.only('express server', () => {
  const
    testFile = '../server.js',
    dataFile = require('../data/index'),
    logr = require('em-logr'),
    noop = () => {
    };

  let box;

  const sf = require('../server-features');

  let express;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    sinon.useFakeTimers();
    box.stub(dataFile, 'update').callsFake(noop);
    box.stub(logr, 'create').callsFake(() => logr);
    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => {
        box.stub(logr, level).callsFake(noop);
      });

    box.stub(sf, 'listen').callsFake(sinon.spy(async (f) => {
      express = f;
      return f;
    }));
    // express().use(bodyParser.json());
  });

  // retores the sandbox
  afterEach(() => {
    box.restore();
    if (express && express.server) {
      const s = express.server.listen();
      s.close();
    }
  });

  context.only('get /info', () => {
    it('it should call get /info', (done) => {
      express = cleanrequire(testFile);
      express.loadServer()
        .then((app) => {
          request(app).get('/info').expect('Content-Type', /json/)
            .expect(200, done);
        })
        .catch((error) => { done(error); });
    });
  });

  context('get /healthcheck', () => {
    it('it should call get /healthcheck', (done) => {
      express = cleanrequire(testFile);
      express.loadServer().then((app) => {
        request(app).get('/healthcheck')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
    });
  });

  context('get /convert', () => {
    context('valid request', () => {
      const url = '/convert?value=1000&from=EUR&to=USD';
      it('should export expected functions', (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          const expected = {
            fixed: '1199.47',
            from: 'EUR',
            result: 1199.4707934859139,
            to: 'USD',
            value: 1000,
          };
          request(app).get(url).expect('Content-Type', /json/).expect(200, expected, done);
        });
      });
    });
  });

  context('INVALID request', () => {
    context('missing *from* argument', () => {
      const url = '/convert?value=1000&to=USD';
      it(`requesting ${url} should fail`, (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          request(app).get(url).expect(500, {error: 'Unknown currency code [UNDEFINED] in from'}, done);
        });
      });
    });

    context('missing *to* argument', () => {
      const url = '/convert?value=1000&from=USD';
      it(`requesting ${url} should fail`, (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          request(app).get(url).expect(500, {error: 'Unknown currency code [UNDEFINED] in to'}, done);
        });
      });
    });
    context('missing *value* argument', () => {
      const url = '/convert?from=EUR&to=USD';
      it(`requesting ${url} should fail`, (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          request(app).get(url).expect(500, {error: 'Invalid value [NaN]'}, done);
        });
      });
    });
  });

  context('get /convert/:expr', () => {
    context('valid request', () => {
      const url = '/convert/1000-from-EUR-to-USD';

      it('should export expected functions', (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          const expected = {
            fixed: '1199.47',
            from: 'EUR',
            result: 1199.4707934859139,
            to: 'USD',
            value: 1000,
          };
          request(app).get(url).expect('Content-Type', /json/).expect(200, expected, done);
        });
      });
    });

    context('INVALID request', () => {
      const url = '/convert/something-that-does-not-match';
      it(`requesting ${url} should fail`, (done) => {
        express = cleanrequire(testFile);
        express.loadServer().then((app) => {
          request(app).get(url).expect(500, {error: 'Invalid expression \'something-that-does-not-match\''}, done);
        });
      });
    });
  });
});

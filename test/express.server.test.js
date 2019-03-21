'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon = require('sinon'),
  cleanrequire = require('@everymundo/cleanrequire');

describe.only('express server', () => {
  const
    chai = require('chai'),
    {expect} = chai,
    testFile = '../server.js',
    dataFile = require('../data/index'),
    logr = require('em-logr'),
    {Reply} = cleanrequire('./fixtures/reply'),
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

  context('get /info', () => {
    it('it should call get /info', async () => {
      const reply = new Reply();

      const {handler} = cleanrequire('../routes/info/get');
      await handler({}, reply);
      expect(reply).to.have.property('statusCode', 200);
    });
  });

  context('get /healthcheck', () => {
    it('it should call get /healthcheck', async () => {
      const reply = new Reply();

      const {handler} = cleanrequire('../routes/healthcheck/get');
      await handler({}, reply);
      expect(reply).to.have.property('statusCode', 200);
    });
  });

  context('get /convert', () => {
    context('valid request', () => {
      it('should export expected functions', async () => {
        const reply = new Reply();

        const {handler} = cleanrequire('../routes/convert/get');
        await handler({params: {value: 1000, from: 'EUR', to: 'USD'}}, reply);
        expect(reply).to.have.property('statusCode', 200);
        const expected = {
          fixed: '1199.47',
          from: 'EUR',
          result: 1199.4707934859139,
          to: 'USD',
          value: 1000,
        };

        expect(reply).to.have.property('body', expected);
      });
    });
  });

  context('INVALID request', () => {
    context('missing *from* argument', () => {
      const url = '/convert?value=1000&to=USD';
      it(`requesting ${url} should fail`, async () => {
        const reply = new Reply();


        const {handler} = cleanrequire('../routes/convert/get');
        await handler({params: {value: 1000, to: 'USD'}}, reply);
        expect(reply).to.have.property('statusCode', 500);
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

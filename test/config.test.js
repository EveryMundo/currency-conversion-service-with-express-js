'require strict';

require('./test-setup.js');

const
  cleanrequire = require('@everymundo/cleanrequire'),
  sinon    = require('sinon'),
  {expect} = require('chai');
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('config.js', () => {
  const
    logr = require('em-logr'),
    noop = () => {};

  let box;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.sandbox.create();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  context('on load', () => {
    it('should export expected keys', () => {
      const { config } = require('../config');

      expect(config).to.have.property('APP_PORT');
      expect(config).to.have.property('LOG_LEVEL');
      expect(config).to.have.property('NUM_OF_WORKERS');
      expect(config).to.have.property('eureka');
    });
  });

  context('APP_PORT', () => {
    const configSupport = require('../config-support');

    before(() => {
      box.stub(configSupport, 'getPortFromFile').callsFake(() => {});
      box.stub(configSupport, 'savePortToFile').callsFake(() => {});

      if (!('APP_PORT' in process.env)) process.env.APP_PORT = '';
    });

    context('When env.APP_PORT has a valid value', () => {
      beforeEach(() => {
        box.stub(process.env, 'APP_PORT').value('2000');
        box.stub(process.env, 'APP_PORT').value('2000');
      });

      it('should set config.APP_PORT with that value', () => {
        const { config } = cleanrequire('../config');

        expect(config).to.have.property('APP_PORT', 2000);
      });
    });

    context('When env.APP_PORT DOES NOT HAVE A valid value', () => {
      beforeEach(() => {
        box.stub(process.env, 'APP_PORT').value('');
      });

      it('should set config.APP_PORT with that value', () => {
        const { config, defaults } = cleanrequire('../config');

        expect(config).to.have.property('APP_PORT', defaults.APP_PORT);
      });
    });
  });

  context('APP_IP', () => {
    before(() => { if (!('APP_IP' in process.env)) process.env.APP_IP = ''; });

    context('When env.APP_IP has a valid value', () => {
      beforeEach(() => {
        box.stub(process.env, 'APP_IP').value('1.2.3.4');
      });

      it('should set config.APP_IP with that value', () => {
        const { config } = cleanrequire('../config');

        expect(config).to.have.property('APP_IP', '1.2.3.4');
      });
    });

    context('When env.APP_IP DOES NOT HAVE A valid value', () => {
      beforeEach(() => {
        box.stub(process.env, 'APP_IP').value('');
      });

      it('should set config.APP_IP with that value', () => {
        const { config, defaults } = cleanrequire('../config');

        expect(config).to.have.property('APP_IP', defaults.APP_IP);
      });
    });
  });

  context('LOG_LEVEL', () => {
    before(() => { if (!('LOG_LEVEL' in process.env)) process.env.LOG_LEVEL = ''; });

    ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach((level) => {
      context(`When env.LOG_LEVEL value is [${level}]`, () => {
        beforeEach(() => {
          box.stub(process.env, 'LOG_LEVEL').value(level);
        });

        it(`should set the value [${level}] to config.LOG_LEVEL`, () => {
          const { config } = cleanrequire('../config');

          expect(config).to.have.property('LOG_LEVEL', level);
        });
      });
    });

    context('When env.LOG_LEVEL DOES NOT HAVE A valid value', () => {
      beforeEach(() => {
        box.stub(process.env, 'LOG_LEVEL').value('some other value');
      });

      it('should set config.LOG_LEVEL with that value', () => {
        const { config, defaults } = cleanrequire('../config');

        expect(config).to.have.property('LOG_LEVEL', defaults.LOG_LEVEL);
      });
    });
  });
});

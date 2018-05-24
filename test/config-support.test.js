'require strict';

/* eslint-disable no-unused-expressions */
require('./test-setup.js');

const
  // cleanrequire = require('@everymundo/cleanrequire'),
  sinon    = require('sinon'),
  {expect} = require('chai');
  // clone    = arg => JSON.parse(JSON.stringify(arg));

describe('config-support.js', () => {
  const
    fs   = require('fs'),
    logr = require('em-logr'),
    noop = () => {};

  let box;
  beforeEach(() => {
    // creates sinon sandbox
    box = sinon.createSandbox();

    // stubs the logr to stop logging during tests
    ['debug', 'info', 'warn', 'error', 'fatal']
      .forEach((level) => { box.stub(logr, level).callsFake(noop); });
  });

  // retores the sandbox
  afterEach(() => { box.restore(); });

  const configSupport = require('../config-support.js');

  context('on load', () => {
    it('should export expected keys', () => {
      expect(configSupport).to.have.property('isValidLogLevel');
      expect(configSupport).to.have.property('getPortFromFile');
      expect(configSupport).to.have.property('savePortToFile');
      expect(configSupport).to.have.property('appPortCacheFile');
      expect(configSupport).to.have.property('validLevels');
    });
  });

  describe('validLevels', () => {
    it('should match [trace, debug, info, warn, error, fatal]', () => {
      const { validLevels } = configSupport;
      const expected =  ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      expect(validLevels).to.deep.equal(expected);
    });

    it('should return a copy of the original array', () => {
      const a = configSupport.validLevels;
      const b = configSupport.validLevels;

      const expected =  ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      expect(a).to.deep.equal(expected);
      expect(b).to.deep.equal(expected);
      expect(a).to.deep.equal(b);
      expect(a).to.not.equal(b);

      a.pop();
      expect(a).to.not.deep.equal(b);
    });
  });

  describe('#isValidLogLevel()', () => {
    context('When level is one of the valid ones', () => {
      it('should return true', () => {
        const { validLevels, isValidLogLevel } = configSupport;
        validLevels.forEach((level) => {
          const res = isValidLogLevel(level);
          expect(res).to.be.true;
        });
      });
    });

    context('When level is NOT A VALID ONE', () => {
      it('should return false', () => {
        const { isValidLogLevel } = configSupport;

        const res = isValidLogLevel('something-else');

        expect(res).to.be.false;
      });
    });
  });

  describe('#getPortFromFile()', () => {
    context('When file exists with a number', () => {
      beforeEach(() => {
        box.stub(fs, 'existsSync').callsFake(() => true);
        box.stub(fs, 'readFileSync').callsFake(() => Buffer.from('1234'));
      });

      it('should load the port number from it and return', () => {
        const { getPortFromFile } = require('../config-support.js');

        const portNumber = getPortFromFile();

        expect(portNumber).to.equal(1234);
      });
    });

    context('When file exists WITHOUT a number', () => {
      beforeEach(() => {
        box.stub(fs, 'existsSync').callsFake(() => true);
        box.stub(fs, 'readFileSync').callsFake(() => Buffer.from('abcd'));
      });

      it('should load the port number from it and return', () => {
        const { getPortFromFile } = require('../config-support.js');

        const portNumber = getPortFromFile();

        expect(portNumber).to.be.undefined;
      });
    });

    context('When file DOES NOT exist', () => {
      beforeEach(() => {
        box.stub(fs, 'existsSync').callsFake(() => false);
      });

      it('should load the port number from it and return', () => {
        const { getPortFromFile } = require('../config-support.js');

        const portNumber = getPortFromFile();

        expect(portNumber).to.be.undefined;
      });
    });

    context('When fs.readFileSync returns an error', () => {
      beforeEach(() => {
        box.stub(fs, 'readFileSync').callsFake(() => { throw new Error('Test Error'); });
      });

      it('should load the port number from it and return', () => {
        const { getPortFromFile } = require('../config-support.js');

        const portNumber = getPortFromFile();

        expect(portNumber).to.be.undefined;
      });
    });
  });

  describe('#savePortToFile()', () => {
    context('When fs.writeFileSync works', () => {
      beforeEach(() => {
        box.stub(fs, 'writeFileSync').callsFake(() => { });
      });

      it('should call fs.writeFileSync and not throw any errors', () => {
        const { savePortToFile, appPortCacheFile } = require('../config-support.js');

        savePortToFile(1234);

        expect(fs.writeFileSync).to.have.property('calledOnce', true);
        expect(fs.writeFileSync.calledWith(appPortCacheFile, 1234)).to.have.be.true;
      });
    });

    context('When fs.writeFileSync DOES NOT work', () => {
      beforeEach(() => {
        box.stub(fs, 'writeFileSync').callsFake(() => { throw new Error('Test Error'); });
        box.stub(process, 'exit').callsFake(() => {});
      });

      it('should call fs.writeFileSync and not throw any errors', () => {
        const { savePortToFile } = require('../config-support.js');

        savePortToFile(1234);

        expect(process.exit).to.have.property('calledOnce', true);
        expect(process.exit.calledWith(1)).to.have.be.true;
      });
    });
  });
});

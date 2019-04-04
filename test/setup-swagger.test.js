'use strict';

/* eslint-disable no-unused-expressions */

require('./test-setup.js');

const
  sinon = require('sinon'),
  cleanrequire = require('@everymundo/cleanrequire');

describe('setup-swagger.js', () => {
  const
    chai = require('chai'),
    {expect} = chai,
    dataFile = require('../data/index'),
    logr = require('em-logr'),
    noop = () => {};

  let box, spy;

  const express = {
    use: noop,
  };


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
    spy = sinon.spy(express.use);
  });

  context('#setupSwagger', () => {
    it('should setup all of the swagger routes', () => {
      console.log({express});
      const {setupSwagger} = cleanrequire('../lib/setup-swagger');
      setupSwagger(express);
    });
  });

  // retores the sandbox
  afterEach(() => {
    box.restore();
    if (express && express.server) {
      const s = express.server.listen();
      s.close();
    }
  });
});

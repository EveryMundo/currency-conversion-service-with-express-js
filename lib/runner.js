#!/usr/bin/env node

'use strict';

const logr = require('em-logr');
// this function allows main modules to be tested
const run = (filename, init) => {
  logr.debug('matching process.argv[1] === filename', {argv1: process.argv[1], filename});
  if (process.argv[1] === filename) {
    return init();
  }
};

module.exports = {run};

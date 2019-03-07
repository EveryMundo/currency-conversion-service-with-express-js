'use strict';

require('@everymundo/global-root-dir').setGlobalRootDir(__dirname);
const helmet = require('helmet');
const bodyParser = require('body-parser');
const logr = require('em-logr').create({name: 'WORKER'});
const {run} = require('@everymundo/runner');
const { loadConfig }          = require('./lib/spring');
const {setupSwagger} = require('./lib/setup-swagger');
const {registerRoutes} = require('./routes/index');

const {listen, stopWorker, setProcessEvents} = require('./server-features');

/**
 * Loads the middleware except request validator and its associated error handler
 * @param {require('express').app} express
 * @returns require('express').app
 */
const expressMiddleware = (express) => {
  express.use(helmet());
  express.use(bodyParser.json());
  return express;
};

const dealWithErrors = express => (error) => {
  logr.error(error);
  stopWorker();

  return express;
};

const init = () => {
  logr.debug('initializing express');
  const {express} = require('./lib/express-singleton');

  return loadConfig()
    .then(() => setProcessEvents(express))
    .then(expressMiddleware)
    .then(registerRoutes)
    .then(setupSwagger)
    .then(listen)
    .catch(dealWithErrors);
};

module.exports = {
  init,
  dealWithErrors,
};

loadConfig()
  .then(() => {
    run(__filename, init);
  })
  .catch((error) => { throw error; });

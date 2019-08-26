'use strict';

const logr     = require('em-logr').create({name: '{MASTER}'});
const localConfig = require('../config').config;


const getEurekaClient = () => new Promise((resolve, reject) => {
  const { asyncClientFromConfigService } = require('@everymundo/em-eureka');
  const spring = require('./spring');

  return spring.loadConfig()
    .then(() => {
      const eurekaCfg = {
        port: localConfig.APP_PORT,
        // ipAddr: 'localhost', #to overwrite local ip to localhost in local env
      };
      return asyncClientFromConfigService(eurekaCfg);
    })
    .then((eurekaCli) => {
      logr.info(`eurekaCli connected = ${eurekaCli.config.status}`, JSON.stringify(eurekaCli.config, null, 2));
      resolve(eurekaCli);
    })
    .catch((err) => {
      logr.error(err);
      reject(err);
    });
});

module.exports = { getEurekaClient };

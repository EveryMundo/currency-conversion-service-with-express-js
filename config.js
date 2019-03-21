'use strict';

const {env}  = process;
const packaJ = require('./package.json');
const micro  = require('microtime');
const ip     = require('ip');

const defaults = {
  APP_PORT: ~~(Math.random() * 64000), // eslint-disable-line no-bitwise
  APP_SEC_PORT: ~~(Math.random() * 64000), // eslint-disable-line no-bitwise
  APP_IP: require('ip').address(),
  LOG_LEVEL: 'info',
  NUM_OF_WORKERS: 1,
};

const { isValidLogLevel, getPortFromFile, savePortToFile } = require('./config-support');

const portFromFile = getPortFromFile();

const APP_PORT = Math.abs(env.APP_PORT) || portFromFile || defaults.APP_PORT;
const APP_SEC_PORT = Math.abs(env.APP_SEC_PORT) || defaults.APP_SEC_PORT;

if (!portFromFile) savePortToFile(APP_PORT);

const APP_IP = ip.isV4Format(env.APP_IP) ? env.APP_IP : defaults.APP_IP;

const LOG_LEVEL = isValidLogLevel(env.LOG_LEVEL) ? env.LOG_LEVEL : defaults.LOG_LEVEL;

const NUM_OF_WORKERS = 1;

const config = {
  APP_PORT,
  APP_SEC_PORT,
  APP_IP,
  LOG_LEVEL,
  NUM_OF_WORKERS,
  datacore: {
    AUTHORIZATION: env.AUTHORIZATION,
    URI: env.DATACORE_URI,
  },
  eureka: {
    app: {
      instanceId: `${packaJ.name}-${micro.now()}`,
      app:        packaJ.name,
      hostName:   env.EUREKA_APP_HOSTNAME,
      ipAddr:     env.EUREKA_APP_IP_ADDR,
      vipAddress: env.EUREKA_VIP_ADDRESS,
    },
    host: env.EUREKA_HOST,
    port: env.EUREKA_PORT,
    servicePath: env.EUREKA_SERVICE_PATH,
  },
};

module.exports = { config, defaults, isValidLogLevel, getPortFromFile, savePortToFile };

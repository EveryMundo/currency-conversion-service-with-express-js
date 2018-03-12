'use strict';

require('dotenv').load();

const {env}  = process;
const packaJ = require('./package.json');
const micro  = require('microtime');

const APP_PORT = Math.abs(env.APP_PORT) || 8907;

const config = {
  APP_PORT,
  APP_IP:         env.APP_IP || '0.0.0.0',
  LOG_LEVEL:      Math.abs(env.LOG_LEVEL) || 'info',
  NUM_OF_WORKERS: Math.abs(env.NUM_OF_WORKERS),
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
      // statusPageUrl,
      port:       APP_PORT,
      securePort: env.EUREKA_APP_SECURE_PORT,
      vipAddress: env.EUREKA_VIP_ADDRESS,
    },
    host: env.EUREKA_HOST,
    port: env.EUREKA_PORT,
  },
};

module.exports = {config};

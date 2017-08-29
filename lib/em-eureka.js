'use strict';

const {Eureka} = require('eureka-js-client');
const rp       = require('request-promise');
const assert   = require('assert');

const coalesce = (...args) => args.reduce((a, b) => a || b);

const configStart = ({instanceId, app, hostName, ipAddr, port, securePort, vipAddress, eureka = {}}) => {
  assert(/^[-\w]{3,}$/.test(app), `Invalid port [${port}]`);
  const eurekaConfig = {
    instance: {
      instanceId,
      app,
      hostName: coalesce(hostName, 'localhost'),
      ipAddr:   coalesce(ipAddr,   '127.0.0.1'),
      // statusPageUrl,
      port:       {$: coalesce(Math.abs(port),        80), '@enabled': 'true'},
      securePort: {$: coalesce(Math.abs(securePort), 443), '@enabled': 'false'},
      vipAddress: coalesce(vipAddress, ipAddr, 'localhost'),
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: coalesce(eureka.host, 'localhost'),
      port: coalesce(Math.abs(eureka.port), 8080),
      servicePath: '/eureka/v2/apps/',
    },
  };

  return eurekaConfig;
};

const get = app => (method, ...params) => {
  const {ipAddr, port} = app;
  return rp(`http://${ipAddr}:${port.$}/${method}/${params.join('/')}`);
};

Eureka.prototype.app = function app(appId) {
  const apps = this.getInstancesByAppId(appId);
  if (!apps.length) throw Error(`App ${appId} not found in Eureka`);

  const retApp = apps[0];
  retApp.get = get(retApp);

  return retApp;
};

// emCli.create({app:'myAppName', hostName:, ipAddr, port, vipAddress, eureka})
/* eslint-disable no-shadow */
const createClient = ({config, app, hostName, ipAddr, port, vipAddress, eureka}) => {
  const client = new Eureka(config || configStart({app, hostName, ipAddr, port, vipAddress, eureka}));

  return client;
};
/* eslint-enable no-shadow */

module.exports = {
  EmEureka: {
    configStart,
    createClient,
  },
};

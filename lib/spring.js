'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const springCloudConfig = require('spring-cloud-config');
const logr     = require('em-logr').create({name: '{MASTER}'});

const {env} = process;


const configOptions = {
  configPath: path.resolve(__dirname, '../config'),
  activeProfiles: env.SPRING_PROFILES_ACTIVE.split(','),
  level: 'info',
};

let config;

function loadConfig(reload = false) {
  return new Promise((resolve, reject) => {
    try {
      if (config && !reload) return resolve(config);
      const doc = yaml.safeLoad(fs.readFileSync(configOptions.configPath + '/bootstrap.yml', 'utf8'));
      doc.spring.cloud.config.endpoint = env.SPRING_CLOUD_CONFIG_URI;
      fs.writeFileSync(configOptions.configPath + '/bootstrap.yml', yaml.safeDump(doc));
      springCloudConfig.load(configOptions)
        .then((conf) => {
          if (conf) {
            config = conf;
            logr.info('Config retrieved');
            return resolve(conf);
          }
          return reject(new Error('No config returned, with configOptions', configOptions));
        })
        .catch(error => reject(error));
    } catch (e) {
      return reject(e);
    }
  });
}

module.exports = {
  loadConfig,
  configOptions,
  get config() { return config; },
};

'use strict';

const logr = require('em-logr').create({ name: 'route /' });

const data = require('../../data');

const path = '/root';

const action = (req, reply) => {
  logr.debug({data});
  data.data.lala = {name:'Daniel', age:18};
  reply.send(data.data);
};

const schema = {
  description: 'It returns list of currencies',
  tags: [require('../../package.json').name],
  summary: 'List of currencies',
  response: {
    200: require('./response.200.schema.json')[200],
  },
};

const options = {schema};

module.exports = {path, action, options};

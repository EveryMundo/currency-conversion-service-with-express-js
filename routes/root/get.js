'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/root/get.js'));

// const logr = require('em-logr').create({ name: 'route /' });

const { data } = require('../../data');

const url = '/';
const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const handler = (req, reply) => {
  reply.json(data);
};

const schema = {
  description: 'It returns list of currencies',
  tags: [require('../../package.json').name],
  summary: 'List of currencies',
  response: {
    200: require('./get.response.200.schema.json'),
  },
};

module.exports = { url, handler, schema, method };

'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/healthcheck/get.js'));

const url = '/healthcheck';

const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const handler = (req, reply) => {
  // sending the result;
  reply.send({ healthy: true, pid: process.pid });
};

const schema = {
  description: 'Performs a healthcheck',
  tags: [require(`${global.__rootdir}/package.json`).name],
  summary: 'Displays a summary of a healthcheck',
  response: {
    200: {
      type: 'object',
      properties: {
        loadedAt: { type: 'string' },  // "BRL"
      },
    },
  },
};

module.exports = { url, handler, schema, method };

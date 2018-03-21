'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/info/get.js'));

const url = '/info';

const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const loadedAt = new Date();

const handler = (req, reply) => {
  // sending the result;
  reply.send({ loadedAt });
};

const schema = {
  description: 'It returns the info/status of the app',
  tags: [require(`${global.__rootdir}/package.json`).name],
  summary: 'Info method for eureka',
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

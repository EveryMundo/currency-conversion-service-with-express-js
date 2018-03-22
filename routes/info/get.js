'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/info/get.js'));

const url = '/info';

const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const loadedAt = new Date();

const handler = (req, reply) => {
  // sending the result;
  const {name, version} = require(`${global.__rootdir}/package.json`);
  reply.send({ app: {name, version}, loadedAt });
};

const schema = {
  description: 'It returns the info/status of the app',
  tags: [require(`${global.__rootdir}/package.json`).name],
  summary: 'Info method for eureka',
  response: {
    200: {
      type: 'object',
      properties: {
        app: {
          type: 'object',
          properties: {
            name:    { type: 'string' },
            version: { type: 'string' },
          },
        },
        loadedAt: { type: 'string' },
      },
    },
  },
};

module.exports = { url, handler, schema, method };

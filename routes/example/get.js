// asserting this file is properly located
require('assert')(__filename.includes('/example/get.js'));

const schema = {
  description: 'It returns hello {name}',
  tags: [require(`${global.__rootdir}/package.json`).name, 'another-tag'],
  summary: 'this is just a get request example',
  params: {
    type: 'string',
    properties: {
      name: {
        type: 'string',
        description: 'name',
      },
    },
  },
  // body: {
  //   type: 'object',
  //   properties: {
  //     hello: { type: 'string' },
  //     obj: {
  //       type: 'object',
  //       properties: {
  //         some: { type: 'string' },
  //       },
  //     },
  //   },
  // },
  response: {
    200: require('./get.response.200.schema.json'),
  },
  security: [{
    api_key: [],
  }],
};

const url    = '/example';
const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const handler = (req, reply) => {
  const { name, ...rest } = req.query;

  // sending the result;
  reply.send({
    hello: name || 'world',
    obj: {
      some: JSON.stringify(rest).replace(/"/g, '\''),
    },
  });
};

module.exports = { url, method, schema, handler };

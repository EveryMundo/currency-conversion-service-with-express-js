/*
'require strict';

require('dotenv').load({path: require('path').join(__dirname, '.env')});
require('chai').should();

const
  sinon  = require('sinon'),
  expect = require('chai').expect,
  cleanrequire = require('@everymundo/cleanrequire'),
  clone  = arg => JSON.parse(JSON.stringify(arg));

describe('index', () => {
  const
    logr = require('../lib/logr'),
    noop = () => {};

  let sandbox;
  beforeEach(() => {
    // console.log('index / beforeEach');
    sandbox = sinon.sandbox.create();
    sandbox.stub(logr,   'log').callsFake(noop);
    sandbox.stub(logr, 'error').callsFake(noop);
  });

  afterEach(() => {
    logr.log.restore();
    logr.error.restore();
    sandbox.restore();
  });

  describe('loading...', () => {
    it('should throw an error if there are not mainEndpoints', () => {
      const
        loadingIndex = () => cleanrequire('../index-kinesis'),
        MAIN_ENDPOINTS_00 = process.env.MAIN_ENDPOINTS_00;

      delete process.env.MAIN_ENDPOINTS_00;

      expect(loadingIndex).to.throw();

      process.env.MAIN_ENDPOINTS_00 = MAIN_ENDPOINTS_00;
    });

    it('should use sendBatchToMultipleDestinations for sendBatch with multiple mainEndpoints', () => {
      const
        loadingIndex = () => Promise.resolve(cleanrequire('../index')),
        MAIN_ENDPOINTS_00 = process.env.MAIN_ENDPOINTS_00;

      const
        urlA = 'http://localhost:8080/url-a',
        urlB = 'http://localhost:8081/url-b';

      process.env.MAIN_ENDPOINTS_00 = [urlA, urlB].join('|');

      loadingIndex().then(index => {
        index.sendBatch.should.equal(index.sendBatchToMultipleDestinations);
      });

      process.env.MAIN_ENDPOINTS_00 = MAIN_ENDPOINTS_00;
    });

    it('should use sendBatchToOneDestination for sendBatch with a single url in mainEndpoints', ()=>{
      const
        loadingIndex = () => Promise.resolve(cleanrequire('../index')),
        MAIN_ENDPOINTS_00 = process.env.MAIN_ENDPOINTS_00;

      const urlA = 'http://localhost:8080/url-a';

      process.env.MAIN_ENDPOINTS_00 = [urlA].join('|');

      loadingIndex().then(index => {
        index.sendBatch.should.equal(index.sendBatchToOneDestination);
      });

      process.env.MAIN_ENDPOINTS_00 = MAIN_ENDPOINTS_00;
    });

    describe('CONSTANTS based on process.env vars', () => {
      const
        loadIndex = () => Promise.resolve(cleanrequire('../index')),
        CONSTANTS_DEFAULT_VALUES = {
          SIMULTANEOUS_BATCHES: 10,
          MAX_SENDER_ATTEMPTS:  5,
          WAIT:                 500,
        };

      Object.keys(CONSTANTS_DEFAULT_VALUES).forEach(constant =>
        describe(constant, ()=> {
          let original;
          beforeEach(() => original = process.env[constant]);
          afterEach( () => process.env[constant] = original);

          it('should accept valid Number', (done) => {
            const randomInt = ~~(Math.random() * 1000);
            process.env[constant] = String(randomInt);

            loadIndex().then(index => {
              index[constant].should.equal(randomInt);
              done();
            });
          });

          it('should NOT accept INvalid Number', (done) => {
            process.env[constant] = `Invalid Number for: ${constant}`;

            loadIndex().then(index => {
              index[constant].should.equal(CONSTANTS_DEFAULT_VALUES[constant]);
              done();
            });
          });
        }));

    });
  });

  describe('#iterateKeys()', () => {
    it('should throw an Error when parameter is not an Array', () => {
      const callit = () => cleanrequire('../index').iterateKeys();

      expect(callit).to.throw(TypeError, 'Keys must be an Array!');
    });
    it('should emit "done" event with an Error when processContent fails', (done) => {
      const emitter = require('../lib/event-emitter');
      emitter.once('done', (arg) => {
        arg.should.be.instanceof(Error);
        done();
      });

      const {iterateKeys} = cleanrequire('../index');
      iterateKeys([{Key:'lala'},'bucket-name']);
    });
  });

  describe('#handler()', () => {
    let s3Helper, fileProcessor, getS3Content, s3;
    beforeEach(() => {
      fileProcessor = cleanrequire('../lib/file-processor');
      s3Helper      = cleanrequire('../lib/s3-helper');
      s3 = s3Helper.s3;
      // console.log('beforeEach');
      getS3Content = sandbox.stub(s3Helper, 'getS3Content');
      sandbox.stub(s3, 'listObjectsV2');
      sandbox.stub(fileProcessor, 'avro');
    });

    afterEach( () => {
      getS3Content.restore();
      s3.listObjectsV2.restore();
      fileProcessor.avro.restore();
    });

    it('should fail when S3 Key does not end with _SUCCESS', (done) => {
      const
        {handler} = cleanrequire('../index'),
        event   = {Records:[{
          s3:{
            object:{key:'s3Key'},
            bucket:{name:'bucket-name'}
          }
        }]},
        context = {
          fail(obj) {
            expect(obj).to.be.instanceof(Object);
            expect(obj).to.have.property('msg');
            expect(obj).to.have.property('event');
            done();
          }
        };

      handler(event, context, noop);
    });

    it('should fail lambda when S3.listObjectsV2 returns an error', (done) => {
      const
        {handler} = cleanrequire('../index'),
        event   = {Records:[{
          s3:{
            object:{key:'s3Key/_SUCCESS'},
            bucket:{name:'bucket-name'}
          }
        }]},
        context = {
          fail(obj) {
            expect(obj).to.be.instanceof(Error);
            done();
          }
        },
        callback = (err) => context.fail(err);

      s3Helper.s3.listObjectsV2.callsFake((config, cb) => {
        cb(new Error('FakeError'));
      });

      handler(event, context, callback);
    });

    it('should fail lambda when S3.listObjectsV2 returns non avro/json files', (done) => {
      const
        {handler} = cleanrequire('../index'),
        event   = {Records:[{
          s3:{
            object:{key:'s3Key/_SUCCESS'},
            bucket:{name:'bucket-name'}
          }
        }]},
        context = {
          fail(obj) {
            expect(obj).to.be.instanceof(Object);
            expect(obj).to.have.property('msg');
            expect(obj).to.have.property('event');
            done();
          }
        },
        callback = (err) => context.fail(err);

      s3Helper.s3.listObjectsV2.callsFake((config, cb) => {
        cb(null, {Contents:[{Key: 'airindex/output/1606201500_1605211500_1706252036_ALL.ext'}]});
      });

      handler(event, context, callback);
    });

    it('should succeed with valid data', (done) => {
      const
        {handler} = cleanrequire('../index'),
        emitter = require('../lib/event-emitter'),
        event   = {Records:[{
          s3:{
            object:{key:'s3Key/_SUCCESS'},
            bucket:{name:'bucket-name'}
          }
        }]},
        context = {
          success(obj) {
            expect(obj).to.be.instanceof(Object);
            expect(obj).to.have.property('msg', 'Done!!!');
            expect(obj).to.have.property('total');
            done();
          },
          fail(err) {
            done(err);
          }
        },
        callback = (err, obj) => {
          if(err)
            return context.fail(err);

          context.success(obj);
        };

      s3.listObjectsV2.callsFake((config, cb) => {
        cb(null, {Contents:[{Key: 'airindex/output/1606201500_1605211500_1706252036_ALL.avro'}]});
      });

      getS3Content.callsFake(() => Promise.resolve({status:200}));

      fileProcessor.avro.callsFake(() => {
        // Real file Processor will fire firstCheckAndSend event
        const
          queue    = [], // empty list of objects to be sent
          attempts = 6;  // number of attempts > max attempts (5)
        emitter.emit('firstCheckAndSend', queue, attempts);
        return Promise.resolve({status:200});
      });

      handler(event, context, callback);
    });

    it('should only export handler when NODE_ENV != test', () => {
      const NODE_ENV = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const index = cleanrequire('../index');
      process.env.NODE_ENV = NODE_ENV;
      Object.keys(index).join().should.equal('handler');
    });

  });

  describe('#processContent()', () => {
    let s3Helper, fileProcessor, getS3Content;
    beforeEach(() => {
      fileProcessor = cleanrequire('../lib/file-processor');
      s3Helper      = cleanrequire('../lib/s3-helper');
      // console.log('beforeEach');
      getS3Content = sandbox.stub(s3Helper, 'getS3Content');
      sandbox.stub(fileProcessor, 'avro');
    });

    afterEach( () => {
      getS3Content.restore();
      fileProcessor.avro.restore();
    });

    it('should fail when Key extension is not implemented', (done) => {
      const
        Key = 'airindex/output/1606201500_1605211500_1706252036_ALL.ext',
        Bucket = 'em-datacore-temp',
        {processContent} = cleanrequire('../index');

      processContent(Key, Bucket)
        .then(() => done('should not have resolved'))
        .catch(err => {
          err.message.should.contain('I don\'t know how to process the extenstion');
          done();
        });
    });

    describe('should fail when getS3Content rejects with', () => {
      it('an Error Object', (done) => {
        getS3Content.callsFake(() => Promise.reject(new Error('getS3Content FakeError')));

        // fileProcessor.avro.callsFake(() => () => Promise.reject(new Error('fileProcessor.avro FakeError')) );

        const
          Key = 'airindex/output/1606201500_1605211500_1706252036_ALL.avro',
          Bucket = 'em-datacore-temp',
          {processContent} = cleanrequire('../index');

        processContent(Key, Bucket)
          .then(() => done('should not have resolved'))
          .catch(err => {
            err.message.should.contain('getS3Content FakeError');
            done();
          });
      });

      it('a String', (done) => {
        getS3Content.callsFake(() => Promise.reject('getS3Content FakeError'));

        // fileProcessor.avro.callsFake(() => () => Promise.reject(new Error('fileProcessor.avro FakeError')) );

        const
          Key = 'airindex/output/1606201500_1605211500_1706252036_ALL.avro',
          Bucket = 'em-datacore-temp',
          {processContent} = cleanrequire('../index');

        processContent(Key, Bucket)
          .then(() => done('should not have resolved'))
          .catch(err => {
            err.message.should.contain('getS3Content FakeError');
            done();
          });
      });
    });
  });

  describe('sendBatch', () => {
    let promiseDataTo;
    beforeEach(() => {
      promiseDataTo = cleanrequire('../lib/promise-data-to');
      sandbox.stub(promiseDataTo, 'promiseDataTo');
    });

    afterEach( () => {
      promiseDataTo.promiseDataTo.restore();
    });

    describe('#sendBatchToMultipleDestinations', () => {
      it('should fail when promiseDataTo fails', (done) => {
        const MAIN_ENDPOINTS_00 = process.env.MAIN_ENDPOINTS_00;
        promiseDataTo.promiseDataTo.callsFake(() => Promise.reject(new Error('FakeError')));
        process.env.MAIN_ENDPOINTS_00 = 'http://test-domain:8008/|http://test-domain:8888/';

        const
          {sendBatchToMultipleDestinations} = cleanrequire('../index'),
          objectsList = [{a:1},{a:2},{a:3},{a:4},{a:5}];
        sendBatchToMultipleDestinations(objectsList, 1)
          .then(data => {
            data.should.be.instanceof(Array);
            data.should.have.property('length', 2);
            data.forEach(o => o.should.be.instanceof(Error));
            done();
          })
          .catch(done)
          .chain(() => process.env.MAIN_ENDPOINTS_00 = MAIN_ENDPOINTS_00);
      });
      it('should succeed when promiseDataTo succeeds', (done) => {
        const MAIN_ENDPOINTS_00 = process.env.MAIN_ENDPOINTS_00;
        promiseDataTo.promiseDataTo.callsFake(() => Promise.resolve({status:234}));
        process.env.MAIN_ENDPOINTS_00 = 'http://test-domain:8008/|http://test-domain:8888/';

        const
          {sendBatchToMultipleDestinations} = cleanrequire('../index'),
          objectsList = [{a:1},{a:2},{a:3},{a:4},{a:5}];
        sendBatchToMultipleDestinations(objectsList, 1)
          .then(data => {
            data.should.be.instanceof(Array);
            data.should.have.property('length', 2);
            data.forEach(o => o.should.have.property('status', 234));
            done();
          })
          .catch(done)
          .chain(() => process.env.MAIN_ENDPOINTS_00 = MAIN_ENDPOINTS_00);
      });
    });

    describe('#sendBatchToOneDestination', () => {
      it('should fail when promiseDataTo fails', (done) => {
        promiseDataTo.promiseDataTo.callsFake(() => Promise.reject(new Error('FakeError')));

        const
          {sendBatchToOneDestination} = cleanrequire('../index'),
          objectsList = [{a:1},{a:2},{a:3},{a:4},{a:5}];
        sendBatchToOneDestination(objectsList, 1)
          .then(data => {
            data.should.be.instanceof(Error);
            done();
          })
          .catch(done);
      });
      it('should succeed when promiseDataTo succeeds', (done) => {
        promiseDataTo.promiseDataTo.callsFake(() => Promise.resolve({status:234}));

        const
          {sendBatchToOneDestination} = cleanrequire('../index'),
          objectsList = [{a:1},{a:2},{a:3},{a:4},{a:5}];
        sendBatchToOneDestination(objectsList, 1)
          .then(data => {
            data.should.have.property('status', 234);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('#sender', () => {
    const fileProcessor = require('../lib/file-processor');
    let promiseDataTo;

    beforeEach(() => {
      // clock = sandbox.useFakeTimers();
      promiseDataTo = cleanrequire('../lib/promise-data-to');
      sandbox.stub(promiseDataTo, 'promiseDataTo');
      sandbox.stub(fileProcessor, 'resetInitalState').callsFake(noop);
      sandbox.stub(fileProcessor, 'stub').callsFake(noop);
    });
    afterEach( () => {
      // clock.restore();
      promiseDataTo.promiseDataTo.restore();
      fileProcessor.resetInitalState.restore();
    });


    it('should emit event "done" passing a proper object when attempt > MAX_SENDER_ATTEMPTS', (done) => {
      const
        emitter = require('../lib/event-emitter'),
        {MAX_SENDER_ATTEMPTS, sender}  = cleanrequire('../index');

      emitter.once('done', (err, data) => {
        data.should.have.property('total');
        data.should.have.property('msg', 'Done!!!');
        done();
      });

      sender([], MAX_SENDER_ATTEMPTS + 1);
    });

    it('should emit event "done" after trying again ONCE when attempt == MAX_SENDER_ATTEMPTS', (done) => {
      const WAIT = process.env.WAIT;
      process.env.WAIT = 1;

      const
        emitter = require('../lib/event-emitter'),
        index   =  cleanrequire('../index'),
        {MAX_SENDER_ATTEMPTS, sender} = index;
      process.env.WAIT = WAIT;

      emitter.once('done', (err, data) => {
        data.should.have.property('total');
        data.should.have.property('msg', 'Done!!!');
        done();
      });

      sender([], MAX_SENDER_ATTEMPTS);
    });

    it('should emit event "done" after posting data with WAIT', (done) => {
      const WAIT = process.env.WAIT;
      const MAX_SENDER_ATTEMPTS = process.env.MAX_SENDER_ATTEMPTS;
      process.env.WAIT =
      process.env.MAX_SENDER_ATTEMPTS = 1;

      promiseDataTo.promiseDataTo.callsFake((config, objectsList) => new Promise(resolve => {
        objectsList.should.deep.equal(expected);
        setTimeout(() => resolve(new Error('FakeError')), WAIT);
      }));

      const
        emitter  = require('../lib/event-emitter'),
        index    =  cleanrequire('../index'),
        {sender} = index,
        queue    = [[{a:1}, {a:2}, {a:3}]],
        expected = clone(queue[0]);

      process.env.WAIT = WAIT;
      process.env.MAX_SENDER_ATTEMPTS = MAX_SENDER_ATTEMPTS;

      emitter.once('done', (err, data) => {
        data.should.have.property('total');
        data.should.have.property('msg', 'Done!!!');
        queue.length.should.equal(0);
        done();
      });

      sender(queue);
    });

    it('should emit event "done" after posting data with NO WAIT', (done) => {
      const WAIT = process.env.WAIT;
      const MAX_SENDER_ATTEMPTS = process.env.MAX_SENDER_ATTEMPTS;
      process.env.WAIT =
      process.env.MAX_SENDER_ATTEMPTS = 1;

      promiseDataTo.promiseDataTo.callsFake((config, objectsList) => {
        objectsList.should.deep.equal(expected);
        return Promise.resolve(new Error('FakeError'));
      });

      const
        emitter  = require('../lib/event-emitter'),
        index    =  cleanrequire('../index'),
        {sender} = index,
        queue    = [[{a:1}, {a:2}, {a:3}]],
        expected = clone(queue[0]);

      process.env.WAIT = WAIT;
      process.env.MAX_SENDER_ATTEMPTS = MAX_SENDER_ATTEMPTS;

      emitter.once('done', (err, data) => {
        data.should.have.property('total');
        data.should.have.property('msg', 'Done!!!');
        queue.length.should.equal(0);
        done();
      });

      sender(queue);
    });
  });
});
*/

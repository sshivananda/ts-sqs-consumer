import winston from 'winston';
import * as sinon from 'sinon';

import SQSConsumer from '../src/SQSConsumer';
import LogLevels from '../src/logger/LogLevels';
import { SQSOptions } from '../src/sqs/SQSOptions';

describe('SQSConsumer', (): void => {
  const logger: winston.Logger = winston.createLogger({
    level: 'error',
    transports: [
      new winston.transports.Console(),
    ],
  });
  const sqsConsumerOpts: SQSOptions = {
    clientOptions: {
      region: 'region-that-does-not-exist',
    },
    receiveMessageOptions: {
      queueUrl: 'url-that-does-not-exist',
      visibilityTimeout: -1,
      waitTimeSeconds: -1,
      maxNumberOfMessages: -1,
      stopAtFirstError: false,
    },
  };

  describe('Object creation', (): void => {
    let createLoggerStub: sinon.SinonSpy;

    beforeEach((): void => {
      createLoggerStub = sinon.spy(winston, 'createLogger');
    });

    afterEach((): void => {
      createLoggerStub.restore();
    });

    it('should be able to create a new object of SQSConsumer with default options', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          sqsOptions: sqsConsumerOpts,
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });

    it('should be able to create a new object of SQSConsumer with log level set to info', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            logLevel: LogLevels.info,
          },
          sqsOptions: sqsConsumerOpts,
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('info');
    });

    it('should be able to create a new object of SQSConsumer with log level set to debug', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            logLevel: LogLevels.debug,
          },
          sqsOptions: sqsConsumerOpts,
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });

    it('should be able to create a new object of SQSConsumer with custom logger', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            customLogger: logger,
          },
          sqsOptions: sqsConsumerOpts,
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(0);
    });

    it('should be able to create a new object of SQSConsumer with max searches set', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          sqsOptions: {
            ...sqsConsumerOpts,
            clientOptions: {
              ...sqsConsumerOpts.clientOptions,
              maxSearches: 10,
            },
          },
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });

    it('should error out if both custom logger and logger options are passed', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            logLevel: LogLevels.info,
            customLogger: logger,
          },
          sqsOptions: sqsConsumerOpts,
        }),
      ).toThrowError();
      expect(createLoggerStub.callCount).toBe(0);
    });
  });
});

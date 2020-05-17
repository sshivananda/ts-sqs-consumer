/* eslint-disable no-console */
import winston from 'winston';
import * as sinon from 'sinon';

import SQSConsumer from '../src/SQSConsumer';
import { SQSOptions } from '../src/sqs/SQSOptions';
import MessageProcessor from '../src/message-processor/MessageProcessor';

const logger: winston.Logger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.Console(),
  ],
});
describe('SQSConsumer', (): void => {
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
      maxSearches: 1,
    },
  };

  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('Object creation', (): void => {
    let createLoggerStub: sinon.SinonSpy;

    beforeEach((): void => {
      createLoggerStub = sinon.spy(winston, 'createLogger');
    });

    afterEach((): void => {
      createLoggerStub.restore();
    });

    it('should be able to create a new object of SQSConsumer with default options', async (): Promise<void> => {
      expect(
        (): SQSConsumer<any> => new SQSConsumer({
          sqsOptions: sqsConsumerOpts,
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });

    it('should be able to create a new object of SQSConsumer with custom logger', async (): Promise<void> => {
      expect(
        (): SQSConsumer<any> => new SQSConsumer({
          logOptions: {
            customLogger: logger,
          },
          sqsOptions: sqsConsumerOpts,
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(0);
    });
  });

  describe('processPendingJobs', (): void => {
    let getMessagesStub: sinon.SinonStub;
    let markMessagesAsProcessedStub: sinon.SinonStub;

    it('should run successfully if fetching, processing and deleting messages succeeds', async (): Promise<void> => {
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.resolves([]);
      markMessagesAsProcessedStub = sinon.stub(MessageProcessor.prototype, 'markMessagesAsProcessed');
      markMessagesAsProcessedStub.resolves([]);
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessor: (async (message: any) => {
          console.log(message);
        }),
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(1);
    });
  });
});

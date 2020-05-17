/* eslint-disable no-console */
import winston from 'winston';
import * as sinon from 'sinon';

import SQSConsumer from '../src/SQSConsumer';
import { SQSOptions } from '../src/sqs/SQSOptions';
import MessageProcessor from '../src/message-processor/MessageProcessor';

describe('SQSConsumer', (): void => {
  const sqsConsumerOpts: SQSOptions = {
    clientOptions: {
      region: 'region-that-does-not-exist',
    },
    receiveMessageOptions: {
      queueUrl: 'url-that-does-not-exist',
      visibilityTimeout: -1,
      waitTimeSeconds: -1,
      maxNumberOfMessages: 1,
      stopAtFirstError: false,
      maxSearches: 1,
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
        (): SQSConsumer<any> => new SQSConsumer({
          sqsOptions: sqsConsumerOpts,
          jobProcessorOptions: {
            jobProcessor: (async (message: any) => {
              console.log(message);
            }),
          },
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });
  });

  describe('processPendingJobs', (): void => {
    let getMessagesStub: sinon.SinonStub;
    let markMessagesAsProcessedStub: sinon.SinonStub;

    beforeEach((): void => {
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.resolves([
        {
          randomKey: 'randomValue',
        },
      ]);
      markMessagesAsProcessedStub = sinon.stub(MessageProcessor.prototype, 'markMessagesAsProcessed');
      markMessagesAsProcessedStub.resolves();
    });

    afterEach((): void => {
      getMessagesStub.restore();
      markMessagesAsProcessedStub.restore();
    });

    it('should run successfully if fetching, processing and deleting messages succeeds', async (): Promise<void> => {
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(1);
    });

    it('should run successfully even if fetching fails', async (): Promise<void> => {
      getMessagesStub.restore();
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.rejects();
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(0);
    });

    it('should run successfully even if fetching returns void', async (): Promise<void> => {
      getMessagesStub.restore();
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.resolves();
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(0);
    });

    it('should throw error if fetching fails and stop at error is set to true', async (): Promise<void> => {
      getMessagesStub.restore();
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.rejects();
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: {
          ...sqsConsumerOpts,
          receiveMessageOptions: {
            ...sqsConsumerOpts.receiveMessageOptions,
            maxSearches: undefined,
          },
        },
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
          stopAtError: true,
        },
      });
      await expect(sqsConsumer.processPendingJobs()).rejects.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(0);
    });

    it('should run successfully on subsequent runs even if fetching fails once', async (): Promise<void> => {
      getMessagesStub.restore();
      getMessagesStub = sinon.stub(MessageProcessor.prototype, 'getMessages');
      getMessagesStub.resolves([]);
      getMessagesStub.onFirstCall().rejects();
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: {
          ...sqsConsumerOpts,
          receiveMessageOptions: {
            ...sqsConsumerOpts.receiveMessageOptions,
            maxSearches: 2,
          },
        },
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(2);
      expect(markMessagesAsProcessedStub.callCount).toBe(1);
    });

    it('should run successfully even if marking messages as processed fails', async (): Promise<void> => {
      markMessagesAsProcessedStub.restore();
      markMessagesAsProcessedStub = sinon.stub(MessageProcessor.prototype, 'markMessagesAsProcessed');
      markMessagesAsProcessedStub.rejects();
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            console.log(message);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(1);
    });

    it('should run successfully even if processing messages fails', async (): Promise<void> => {
      const sqsConsumer: SQSConsumer<any> = new SQSConsumer({
        sqsOptions: sqsConsumerOpts,
        jobProcessorOptions: {
          jobProcessor: (async (message: any) => {
            throw new Error(`Unable to process ${message}`);
          }),
        },
      });
      await expect(sqsConsumer.processPendingJobs()).resolves.not.toThrowError();
      expect(getMessagesStub.callCount).toBe(1);
      expect(markMessagesAsProcessedStub.callCount).toBe(0);
    });
  });
});

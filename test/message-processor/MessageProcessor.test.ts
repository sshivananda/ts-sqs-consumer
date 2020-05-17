import { SQS } from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import * as sinon from 'sinon';

import MessageProcessor from '../../src/message-processor/MessageProcessor';
import { SQSOptions } from '../../src/sqs/SQSOptions';
import Logger from '../../src/logger/Logger';
import LogLevels from '../../src/logger/LogLevels';

// Tests for the MessageProcessor class
describe('MessageProcessor', (): void => {
  const loggerObj: Logger = new Logger({
    logLevel: LogLevels.info,
  });
  type SampleMessageType = {
    data: string;
    handle: string;
  };

  const messageHandle: string = 'handle';
  const data: string = 'random-data';
  const sampleMessage: SampleMessageType = {
    data: data,
    handle: messageHandle,
  };
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
    it('should be able to create a new object of MessageProcessor with client opts defined', async (): Promise<void> => {
      expect(
        (): MessageProcessor<SampleMessageType> => new MessageProcessor({
          logger: loggerObj,
          sqsOptions: sqsConsumerOpts,
        }),
      ).not.toThrowError();
    });

    it('should be able to create a new object of MessageProcessor with sqsClient', async (): Promise<void> => {
      expect(
        (): MessageProcessor<SampleMessageType> => new MessageProcessor({
          logger: loggerObj,
          sqsOptions: {
            receiveMessageOptions: {
              ...sqsConsumerOpts.receiveMessageOptions,
            },
            sqsClient: new SQS(),
          },
        }),
      ).not.toThrowError();
    });

    it(
      'should not be able to create a new object of MessageProcessor when client options and sqs client are passed',
      async (): Promise<void> => {
        expect(
          (): MessageProcessor<SampleMessageType> => new MessageProcessor({
            logger: loggerObj,
            sqsOptions: {
              ...sqsConsumerOpts,
              sqsClient: new SQS(),
            },
          }),
        ).toThrowError();
      },
    );
  });

  describe('getMessage', (): void => {
    afterEach((): void => {
      AWSMock.restore('SQS', 'receiveMessage');
    });

    it('should retreive a message when one is available', async (): Promise<void> => {
      const receiveWithMessage: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(undefined, {
          Messages: [{
            Body: JSON.stringify(sampleMessage),
            ReceiptHandle: messageHandle,
          }],
        });
      });
      AWSMock.mock('SQS', 'receiveMessage', receiveWithMessage);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      const messages: SampleMessageType[] | void = await messageProcessor.getMessages();
      expect(messages)
        .toStrictEqual([
          sampleMessage,
        ]);
    });

    it('should return an empty array when no messages are available - test1', async (): Promise<void> => {
      const receieveWithNoMsgs: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(undefined, {
          Messages: [],
        });
      });
      AWSMock.mock('SQS', 'receiveMessage', receieveWithNoMsgs);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      const messages: SampleMessageType[] | void = await messageProcessor.getMessages();
      expect(messages)
        .toStrictEqual([]);
    });

    it('should return an empty array when no messages are available - test2', async (): Promise<void> => {
      const receieveWithNoMsgs: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(undefined, {
          Messages: undefined,
        });
      });
      AWSMock.mock('SQS', 'receiveMessage', receieveWithNoMsgs);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      const messages: SampleMessageType[] | void = await messageProcessor.getMessages();
      expect(messages)
        .toStrictEqual([]);
    });

    it('should not throw an error and return an empty array when invalid messages are found', async (): Promise<void> => {
      const receieveWithNoMsgs: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(undefined, {
          Messages: [{
            Body: "'",
            ReceiptHandle: messageHandle,
          }],
        });
      });
      AWSMock.mock('SQS', 'receiveMessage', receieveWithNoMsgs);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      const messages: SampleMessageType[] | void = await messageProcessor.getMessages();
      expect(messages)
        .toStrictEqual([]);
    });

    it('should throw an error if fetching messages fails', async (): Promise<void> => {
      const receiveWithError: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(new Error(), undefined);
      });
      AWSMock.mock('SQS', 'receiveMessage', receiveWithError);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      await expect(messageProcessor.getMessages()).rejects.toThrowError();
    });
  });

  describe('markMessagesAsProcessed', (): void => {
    afterEach((): void => {
      AWSMock.restore('SQS', 'deleteMessageBatch');
    });

    it('should run successfully if deleteBatch passes', async (): Promise<void> => {
      const deleteWithSuccess: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(undefined);
      });
      AWSMock.mock('SQS', 'deleteMessageBatch', deleteWithSuccess);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      await expect(messageProcessor.markMessagesAsProcessed({
        messages: [
          sampleMessage,
        ],
      })).resolves.not.toThrowError();
    });

    it('should throw an error if deleteBatch fails', async (): Promise<void> => {
      const deleteWithFailure: sinon.SinonSpy = sinon.spy((params: any, callback: any): void => {
        callback(new Error(), undefined);
      });
      AWSMock.mock('SQS', 'deleteMessageBatch', deleteWithFailure);
      const messageProcessor: MessageProcessor<SampleMessageType> = new MessageProcessor({
        logger: loggerObj,
        sqsOptions: sqsConsumerOpts,
      });
      await expect(messageProcessor.markMessagesAsProcessed({
        messages: [
          sampleMessage,
        ],
      })).rejects.toThrowError();
    });
  });
});

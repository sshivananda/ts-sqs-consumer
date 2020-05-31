import { SQS } from 'aws-sdk';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { SQSConsumer } from '../..';

const feature = loadFeature('./integration-test/features/processes_all_messages_if_there_is_no_error.feature');

jest.setTimeout(1200000);
defineFeature(feature, test => {
  test('When there are no errors, processes all messages', ({ given, when, then }) => {
    const sqs: SQS = new SQS({
      endpoint: 'http://localhost:4566',
      region: 'local',
    });
    const queueUrl: string = 'http://localhost:4566/queue/test_queue';
    type OrderDetails = {
      handle: string;
      orderId: string;
      orderItemName: string;
    };
    const bookOrder: OrderDetails = {
      handle: '12',
      orderId: 'testId1',
      orderItemName: 'book',
    };

    given('there are messages in sqs queue', async (): Promise<void> => {
      await sqs.purgeQueue({
        QueueUrl: queueUrl
      }).promise();
      Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000
      );
      await sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(bookOrder),
      }).promise();
      let currentNumberOfMessages: number = -1;
      let retryAttemptsLeft: number = 20;
      do {
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000
        );
        const sqsQueueAttributes: SQS.GetQueueAttributesResult = await sqs.getQueueAttributes({
          QueueUrl: queueUrl,
          AttributeNames: [
            'All',
          ],
        }).promise();
        expect(sqsQueueAttributes.Attributes).toBeDefined();
        expect(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages).toBeDefined();
        currentNumberOfMessages = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages, 10);
        retryAttemptsLeft--;
      } while (
        (currentNumberOfMessages < 1)
        && (retryAttemptsLeft > 0)
      );
      expect(currentNumberOfMessages).toBe(1);
    });

    when('ts-sqs-consumer is invoked', async (): Promise<void> => {
      const tsSQSConsumer: SQSConsumer<OrderDetails> = new SQSConsumer({
        sqsOptions: {
          clientOptions: {
            region: 'local',
          },
          receiveMessageOptions: {
            queueUrl: queueUrl,
            visibilityTimeout: 1800,
            waitTimeSeconds: 20,
            maxNumberOfMessages: 1,
            stopAtFirstError: false,
            maxSearches: 1,
          },
        },
        jobProcessorOptions: {
          jobProcessor: (async (message: OrderDetails) => {
            console.log('Got message');
            console.log(message);
          }),
        },
      });
      await tsSQSConsumer
        .processPendingJobs()
        .catch((err: Error): void => {
          throw err;
        });
    });

    then('all messages should be processed', async (): Promise<void> => {
      const sqsQueueAttributes: SQS.GetQueueAttributesResult = await sqs.getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: [
          'All',
        ],
      }).promise();
      expect(sqsQueueAttributes.Attributes).toBeDefined();
      const numberOfMessagesVisible: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages, 10);
      const numberOfMessagesDelayed: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesDelayed, 10);
      const numberOfMessagesNotVisible: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesNotVisible, 10);
      const totalMessages: number = numberOfMessagesVisible + numberOfMessagesDelayed + numberOfMessagesNotVisible;
      expect(totalMessages).toBe(0);
    });
  });
});
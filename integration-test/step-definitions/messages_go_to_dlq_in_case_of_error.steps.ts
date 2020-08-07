import { SQS } from 'aws-sdk';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { SQSConsumer } from '../..';
import AWSHelper from '../AWSHelper';

/* eslint-disable no-console */
/* eslint-disable jest/no-test-callback */

const feature = loadFeature('./integration-test/features/messages_go_to_dlq_in_case_of_error.feature');

jest.setTimeout(1200000);
const awsHelper: AWSHelper = new AWSHelper();
defineFeature(feature, (test) => {
  test('When there are errors, messages go to DLQ', ({ given, when, then }) => {
    const sqs: SQS = new SQS({
      endpoint: 'http://localhost:4576',
      region: 'local',
    });
    const queueUrl: string = 'http://localhost:4576/queue/test_queue';
    const dlqUrl: string = 'http://localhost:4576/queue/test_queue_dlq';
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
    const mockJobProcessor = jest.fn().mockImplementation((async (message: OrderDetails) => {
      console.log('Got message');
      console.log(message);
      throw new Error('Random error');
    }));
    given('there are messages in sqs queue', async (): Promise<void> => {
      await awsHelper.purgeQueues({
        sqs: sqs,
      }).catch((err: Error) => {
        console.log(err);
        throw err;
      });
      Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000,
      );
      await sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(bookOrder),
      }).promise().catch((err: Error) => {
        console.log(err);
        throw err;
      });
      let currentNumberOfMessages: number = -1;
      let retryAttemptsLeft: number = 20;
      do {
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000,
        );
        const sqsQueueAttributes: SQS.GetQueueAttributesResult = await sqs.getQueueAttributes({
          QueueUrl: queueUrl,
          AttributeNames: [
            'All',
          ],
        }).promise().catch((err: Error) => {
          console.log(err);
          throw err;
        });
        expect(sqsQueueAttributes.Attributes).toBeDefined();
        expect(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages).toBeDefined();
        currentNumberOfMessages = parseInt(
          sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages, 10,
        );
        retryAttemptsLeft -= 1;
      } while (
        (currentNumberOfMessages < 1)
        && (retryAttemptsLeft > 0)
      );
      expect(currentNumberOfMessages).toBe(1);
    });

    when('ts-sqs-consumer is invoked and messages are processed with errors', async (): Promise<void> => {
      const tsSQSConsumer: SQSConsumer<OrderDetails> = new SQSConsumer({
        sqsOptions: {
          clientOptions: {
            region: 'local',
          },
          receiveMessageOptions: {
            queueUrl: queueUrl,
            visibilityTimeout: 4,
            waitTimeSeconds: 20,
            maxNumberOfMessages: 1,
            stopAtFirstError: false,
            maxSearches: 3,
          },
        },
        jobProcessorOptions: {
          jobProcessor: (async (message: OrderDetails) => mockJobProcessor(message)),
        },
      });
      await tsSQSConsumer
        .processPendingJobs()
        .catch((err: Error): void => {
          console.log(err);
          throw err;
        });
      Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000,
      );
    });

    then('all messages should be processed and messages that failed processing should go to the DLQ', async (): Promise<void> => {
      const totalMessagesInMainQueue: number = await awsHelper.getTotalNumberOfMessagesInQueue({
        sqs: sqs,
        queueUrl: queueUrl,
      }).catch((err: Error) => {
        console.log(err);
        throw err;
      });
      const totalMessagesInDLQ: number = await awsHelper.getTotalNumberOfMessagesInQueue({
        sqs: sqs,
        queueUrl: dlqUrl,
      }).catch((err: Error) => {
        console.log(err);
        throw err;
      });
      expect(totalMessagesInMainQueue).toBe(0);
      expect(totalMessagesInDLQ).toBe(1);
      expect(mockJobProcessor.mock.calls.length).toBe(1);
    });
  });
});

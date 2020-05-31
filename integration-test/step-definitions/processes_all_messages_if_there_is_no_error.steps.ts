import { SQS } from 'aws-sdk';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { SQSConsumer } from '../..';

const feature = loadFeature('./integration-test/features/processes_all_messages_if_there_is_no_error.feature');

async function getTotalNumberOfMessagesInQueue(options: {
  sqs: SQS;
  queueUrl: string;
}): Promise<number> {
  const sqsQueueAttributes: SQS.GetQueueAttributesResult = await options.sqs.getQueueAttributes({
    QueueUrl: options.queueUrl,
    AttributeNames: [
      'All',
    ],
  }).promise();
  expect(sqsQueueAttributes.Attributes).toBeDefined();
  const numberOfMessagesVisible: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages, 10);
  const numberOfMessagesDelayed: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesDelayed, 10);
  const numberOfMessagesNotVisible: number = parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesNotVisible, 10);

  return (numberOfMessagesVisible + numberOfMessagesDelayed + numberOfMessagesNotVisible);
}
jest.setTimeout(1200000);
defineFeature(feature, test => {
  test('When there are no errors, processes all messages', ({ given, when, then }) => {
    const sqs: SQS = new SQS({
      endpoint: 'http://localhost:4566',
      region: 'local',
    });
    const queueUrl: string = 'http://localhost:4566/queue/test_queue';
    const dlqUrl: string = 'http://localhost:4566/queue/test_queue_dlq';
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
    }));
    given('there are messages in sqs queue', async (): Promise<void> => {
      await sqs.purgeQueue({
        QueueUrl: queueUrl,
      }).promise();
      await sqs.purgeQueue({
        QueueUrl: dlqUrl,
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

    when('ts-sqs-consumer is invoked and messages are processed successfully', async (): Promise<void> => {
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
          jobProcessor: (async (message: OrderDetails) => mockJobProcessor(message)),
        },
      });
      await tsSQSConsumer
        .processPendingJobs()
        .catch((err: Error): void => {
          throw err;
        });
    });

    then('all messages should be processed without any messages going to DLQ', async (): Promise<void> => {
      const totalMessagesInMainQueue: number = await getTotalNumberOfMessagesInQueue({
        sqs: sqs,
        queueUrl: queueUrl,
      });
      const totalMessagesInDLQ: number = await getTotalNumberOfMessagesInQueue({
        sqs: sqs,
        queueUrl: dlqUrl,
      });
      expect(totalMessagesInMainQueue).toBe(0);
      expect(totalMessagesInDLQ).toBe(0);
      expect(mockJobProcessor.mock.calls.length).toBe(1);
    });
  });
});
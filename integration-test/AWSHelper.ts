import { SQS } from 'aws-sdk';

export default class AWSHelper {
  public queueUrl: string = 'http://localhost:4566/queue/test_queue';

  public dlqUrl: string = 'http://localhost:4566/queue/test_queue_dlq';

  public async purgeQueues(options: {
    sqs: SQS;
  }): Promise<void> {
    await options.sqs.purgeQueue({
      QueueUrl: this.queueUrl,
    }).promise();
    await options.sqs.purgeQueue({
      QueueUrl: this.dlqUrl,
    }).promise();
  }

  // eslint-disable-next-line class-methods-use-this
  public async getTotalNumberOfMessagesInQueue(options: {
    sqs: SQS;
    queueUrl: string;
  }): Promise<number> {
    const sqsQueueAttributes: SQS.GetQueueAttributesResult = await options.sqs.getQueueAttributes({
      QueueUrl: options.queueUrl,
      AttributeNames: [
        'All',
      ],
    }).promise();
    // eslint-disable-next-line jest/no-standalone-expect
    expect(sqsQueueAttributes.Attributes).toBeDefined();
    const numberOfMessagesVisible: number = parseInt(
      sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages, 10,
    );
    const numberOfMessagesDelayed: number = parseInt(
      sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesDelayed, 10,
    );
    const numberOfMessagesNotVisible: number = parseInt(
      sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesNotVisible, 10,
    );

    return (numberOfMessagesVisible + numberOfMessagesDelayed + numberOfMessagesNotVisible);
  }
}

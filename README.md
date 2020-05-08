# ts-sqs-consumer

![Node.js CI](https://github.com/sshivananda/ts-sqs-consumer/workflows/Node.js%20CI/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/b9f88fae02b434d038f1/maintainability)](https://codeclimate.com/github/sshivananda/ts-sqs-consumer/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b9f88fae02b434d038f1/test_coverage)](https://codeclimate.com/github/sshivananda/ts-sqs-consumer/test_coverage)

Typescript based sqs consumer. Handles message transport and deletion from SQS: just add a handler function for the messages from SQS to get started.

## Usage

```ts
const tsSQSConsumer: SQSConsumer<TestMessageType> = new SQSConsumer({
    sqsOptions: {
      clientOptions: {
        region: 'us-east-1',
      },
      receiveMessageOptions: {
        queueUrl: 'url-of-your-queue',
        visibilityTimeout: 1800,
        waitTimeSeconds: 20,
        maxNumberOfMessages: 1,
        stopAtFirstError: false,
      },
    },
    jobProcessor: (async (message: TestMessageType) => {
      console.log('Got message');
      console.log(message);
    }),
  });
  await tsSQSConsumer
    .processPendingJobs()
    .catch((err: Error): void => {
      throw err;
    });
```
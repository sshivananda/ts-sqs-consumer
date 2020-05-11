# ts-sqs-consumer

Build Stats:

![npm](https://img.shields.io/npm/dm/ts-sqs-consumer?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/sshivananda/ts-sqs-consumer/Node.js%20CI?style=for-the-badge)

Maintainability stats:

![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/sshivananda/ts-sqs-consumer?style=for-the-badge)
![Code Climate coverage](https://img.shields.io/codeclimate/coverage/sshivananda/ts-sqs-consumer?style=for-the-badge)
[![GitHub issues](https://img.shields.io/github/issues/sshivananda/ts-sqs-consumer?label=OPEN%20ISSUES&style=for-the-badge)](https://github.com/sshivananda/ts-sqs-consumer/issues)

Publish stats:

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/sshivananda/ts-sqs-consumer?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/sshivananda/ts-sqs-consumer?style=for-the-badge)

Dependencies:

![David - Dependencies](https://img.shields.io/david/sshivananda/ts-sqs-consumer?style=for-the-badge)
![David - Dev Dependencies](https://img.shields.io/david/dev/sshivananda/ts-sqs-consumer?color=green&style=for-the-badge)

Typescript based sqs consumer. Handles message transport and deletion from SQS: just add a handler function for the messages from SQS to get started.

## Usage

```ts
import { SQSConsumer } from 'ts-sqs-consumer';

type TestMessageType = {
  orderId: string;
  handle: string;
};

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
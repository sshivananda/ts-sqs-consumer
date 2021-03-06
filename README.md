# ts-sqs-consumer

Typescript based sqs consumer. Handles message transport and deletion from
SQS: just add a handler function for the messages from SQS to get started.

Integrated with localstack, codeClimate, fossa.

Build Stats:

![npm](https://img.shields.io/npm/dm/ts-sqs-consumer)
![GitHub Workflow Status (branch)](https://github.com/sshivananda/ts-sqs-consumer/workflows/Node.js%20CI/badge.svg?event=push)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/sshivananda/ts-sqs-consumer/issues)

Maintainability stats:

![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/sshivananda/ts-sqs-consumer)
![Code Climate coverage](https://img.shields.io/codeclimate/coverage/sshivananda/ts-sqs-consumer)
[![GitHub issues](https://img.shields.io/github/issues/sshivananda/ts-sqs-consumer?label=Open%20Issues)](https://github.com/sshivananda/ts-sqs-consumer/issues)

Publish stats:

![npm](https://img.shields.io/npm/v/ts-sqs-consumer)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/sshivananda/ts-sqs-consumer?label=Git%20Tag)
![GitHub](https://img.shields.io/github/license/sshivananda/ts-sqs-consumer)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsshivananda%2Fts-sqs-consumer.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsshivananda%2Fts-sqs-consumer?ref=badge_shield)

Dependencies:

![David - Dependencies](https://img.shields.io/david/sshivananda/ts-sqs-consumer)
![David - Dev Dependencies](https://img.shields.io/david/dev/sshivananda/ts-sqs-consumer?color=green)

## Table Of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Background

`ts-sqs-consumer` allows you to start processing messages from SQS by just
passing in the connection configuration options and defining what needs to
be done as part of the job processing.

- Establishes a connection to the sqs queue
- [Longpolls](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html)
  for messages
- If messages are found: processes them using the processor function used
- If the message processing is successful: the message is deleted from the queue

The library has a heavy emphasis on code quality and is integrated with
the following tools:

- Integrated with [local stack](https://localstack.cloud/) to run integration tests.
  This ensures that the library is tested as it would be expected to be used in a
  live environment.
- [Code Climate](https://codeclimate.com/github/sshivananda/ts-sqs-consumer/): for
  code quality and maintainability
- [FOSSA](https://app.fossa.io/projects/git%2Bgithub.com%2Fsshivananda%2Fts-sqs-consumer) -
  for license check. Verfies that dependencies used in this library
  do not go beyond the license that this library adheres to. A detailed link
  is available in the [License](##License) section of the document.
- Whitesource to scan for security vulnerabilities. Note that this does not
  currently cause build failures: but does get reported as an open issue.

## Installation

```bash
npm install ts-sqs-consumer
```

## Usage

```ts
import { SQSConsumer } from 'ts-sqs-consumer';

// Define a datatype for the message being consumed
type TestMessageType = {
  orderId: string;
  handle: string;
};

const tsSQSConsumer: SQSConsumer<TestMessageType> = new SQSConsumer({
    // Provide the connection options
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
    // Define what needs to be done with each message
    jobProcessor: (async (message: TestMessageType) => {
      console.log('Got message');
      console.log(message);
      // other processing steps
    }),
  });

  // Start processing messages
  await tsSQSConsumer
    .processPendingJobs()
    .catch((err: Error): void => {
      throw err;
    });
```

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsshivananda%2Fts-sqs-consumer.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsshivananda%2Fts-sqs-consumer?ref=badge_large)

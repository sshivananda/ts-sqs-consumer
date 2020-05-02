#!/usr/bin/env ts-node-script

/**
 * @file Exports the logger interface.
 */

/* eslint-disable no-console */
/* eslint-disable no-new */

import { SQSConsumer, SQSConsumerOptions } from './index';

/**
 * This script acts as a consumer for the code in this repository.
 * Only imports from index.ts file are allowed here: no other files
 * should be imported directly. To run this script: use ./node_modules/.bin/ts-node repl.ts.
 */

/**
 * Provides sample usage of the sqs consumer.
 */
async function testSQSConsumer(): Promise<void> {
  const sqsConsumerOpts: SQSConsumerOptions = {
    logOptions: {},
    sqsOptions: {
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
    },
  };
  const tsSQSConsumer: SQSConsumer = new SQSConsumer(sqsConsumerOpts);
  await tsSQSConsumer
    .processPendingJobs()
    .catch((err: Error): void => {
      throw err;
    });
}

testSQSConsumer();

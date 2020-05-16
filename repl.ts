#!/usr/bin/env ts-node-script

/**
 * @file Exports the logger interface.
 */

/* eslint-disable no-console */
/* eslint-disable no-new */

import { SQSConsumer } from './index';

/**
 * This script acts as a consumer for the code in this repository.
 * Only imports from index.ts file are allowed here: no other files
 * should be imported directly. To run this script: use ./node_modules/.bin/ts-node repl.ts.
 */

type TestMessageType = {
  orderId: string;
  handle: string;
};

/**
 * Provides sample usage of the sqs consumer.
 */
async function testSQSConsumer(): Promise<void> {
  const tsSQSConsumer: SQSConsumer<TestMessageType> = new SQSConsumer({
    sqsOptions: {
      clientOptions: {
        region: 'region-that-does-not-exist',
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
}

testSQSConsumer();

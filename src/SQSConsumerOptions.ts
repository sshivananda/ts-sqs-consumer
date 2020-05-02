import { LoggerOptions } from './logger/LoggerOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  sqsOptions: {
    maxSearches?: number;
    region?: string;
    queueUrl?: string;
    waitTimeSeconds?: number;
    visibilityTimeout?: number;
  }
};

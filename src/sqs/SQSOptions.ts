import { SQS } from 'aws-sdk';

export type SQSOptions = {
  maxSearches?: number;
  region?: string;
  queueUrl?: string;
  waitTimeSeconds?: number;
  visibilityTimeout?: number;
  sqsObj?: SQS;
};

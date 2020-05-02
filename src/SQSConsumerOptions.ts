import { LoggerOptions } from './logger/LoggerOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  sqsOptions?: {
    maxSearches?: number;
  }
};

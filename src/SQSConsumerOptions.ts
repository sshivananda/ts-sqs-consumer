import { LoggerOptions } from './logger/LoggerOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  maxSearches?: number;
  sqsOptions?: {
    maxSearches?: number;
  }
};

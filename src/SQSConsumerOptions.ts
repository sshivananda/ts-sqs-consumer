import { LoggerOptions } from './LoggerOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  maxSearches?: number;
};

import { LoggerOptions } from './logger/LoggerOptions';
import { SQSOptions } from './SQSOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  sqsOptions: SQSOptions;
};

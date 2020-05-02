import { LoggerOptions } from './logger/LoggerOptions';
import { SQSOptions } from './sqs/SQSOptions';

export type SQSConsumerOptions = {
  logOptions?: LoggerOptions;
  sqsOptions: SQSOptions;
};

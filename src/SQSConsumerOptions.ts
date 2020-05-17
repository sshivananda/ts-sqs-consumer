import { SQSOptions } from './sqs/SQSOptions';

export type SQSConsumerOptions<T> = {
  sqsOptions: SQSOptions;
  jobProcessorOptions: {
    jobProcessor: ((message: T) => Promise<void>)
    stopAtError?: boolean;
  }
};

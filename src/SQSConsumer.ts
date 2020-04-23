import winston from 'winston';

import { SQSConsumerOptions } from './SQSConsumerOptions';

/**
 * SQSConsumer
 * Contains functionality to manage different components that
 * consume and delete messages from SQS
 */
export default class SQSConsumer {
  // Instance of a logger object
  private readonly logger: winston.Logger;

  // max searches config - defaults to -1
  private readonly maxSearches: number = -1;

  // sets log level for the package
  private logLevel: string = 'debug';

  constructor(options?: SQSConsumerOptions) {
    if (options != null
      && options.logOptions != null
      && options.logOptions.verbose === true) {
      this.logLevel = 'info';
    }
    if (options != null
      && options.logOptions != null
      && options.logOptions.customLogger != null) {
      this.logger = options.logOptions.customLogger;
    } else {
      this.logger = winston.createLogger({
        level: this.logLevel,
        format: winston.format.json(),
        transports: [
          new winston.transports.Console(),
        ],
      });
    }
    if (options != null
      && options.maxSearches != null) {
      this.maxSearches = options.maxSearches;
    }
  }

  /**
   * processPendingJobs
   * Polls for pending jobs and processes them
   */
  public async processPendingJobs(): Promise<number> {
    let searchCounter = 0;
    while (searchCounter !== this.maxSearches) {
      try {
        this.logger.log(this.logLevel, 'Searching for sqs messages');
      } finally {
        searchCounter += 1;
      }
    }

    return searchCounter;
  }
}

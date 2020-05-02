import { SQSConsumerOptions } from './SQSConsumerOptions';
import LogLevels from './logger/LogLevels';
import { CustomLogger } from './logger/CustomLogger';
import { ILogger } from './logger/ILogger';
import { CustomLogOptions } from './logger/CustomLogOptions';
import Logger from './logger/Logger';

/**
 * Contains functionality to manage different components that
 * consume and delete messages from SQS.
 */
export default class SQSConsumer {
  // Instance of a logger object
  private readonly logger: ILogger;

  // max searches config - defaults to -1
  private readonly maxSearches: number = -1;

  constructor(options?: SQSConsumerOptions) {
    if (options != null
      && options.logOptions != null
      && (options.logOptions as CustomLogger).customLogger != null) {
      this.logger = (options.logOptions as CustomLogger).customLogger;
    } else {
      let logLevel: LogLevels = LogLevels.debug;
      if (options != null
        && options.logOptions != null
        && (options.logOptions as CustomLogOptions).logLevel != null) {
        logLevel = (options.logOptions as CustomLogOptions).logLevel!;
      }
      this.logger = new Logger({
        logLevel: logLevel,
      });
    }

    if (options != null
      && options.sqsOptions.maxSearches != null) {
      this.maxSearches = options.sqsOptions.maxSearches;
    }
  }

  /**
   * Polls for pending jobs and processes them.
   */
  public async processPendingJobs(): Promise<number> {
    let searchCounter = 0;
    while (searchCounter !== this.maxSearches) {
      try {
        this.logger.log('Searching for sqs messages');
      } finally {
        searchCounter += 1;
      }
    }

    return searchCounter;
  }
}

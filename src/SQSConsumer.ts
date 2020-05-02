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
    switch (true) {
      case (options != null
        && options.logOptions != null
        && (options.logOptions as CustomLogOptions).logLevel != null
        && (options.logOptions as CustomLogger).customLogger != null):
        throw new Error('Either logLevel or customLogger should be specified - but not both.');
      case (options != null
        && options.logOptions != null
        && (options.logOptions as CustomLogger).customLogger != null):
        this.logger = (options!.logOptions as CustomLogger).customLogger;
        break;
      case (options != null
        && options.logOptions != null
        && (options.logOptions as CustomLogOptions).logLevel != null):
        this.logger = new Logger({
          logLevel: (options!.logOptions as CustomLogOptions).logLevel,
        });
        break;
      default:
        this.logger = new Logger({
          logLevel: LogLevels.debug,
        });
        break;
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

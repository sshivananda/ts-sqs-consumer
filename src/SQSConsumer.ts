import { SQSConsumerOptions } from './SQSConsumerOptions';
import LogLevels from './logger/LogLevels';
import { CustomLogger } from './logger/CustomLogger';
import { ILogger } from './logger/ILogger';
import Logger from './logger/Logger';
import { SQSMessage } from './message-processor/SQSMessage';
import MessageProcessor from './message-processor/MessageProcessor';

/**
 * Contains functionality to manage different components that
 * consume and delete messages from SQS.
 */
export default class SQSConsumer<T extends SQSMessage> {
  // Instance of a logger object
  private readonly logger: ILogger;

  // max searches config - defaults to -1
  private readonly maxSearches: number = -1;

  private messageProcessor: MessageProcessor<T>;

  private jobProcessor: ((message: T) => Promise<void>);

  constructor(options: SQSConsumerOptions & {
    jobProcessor: ((message: T) => Promise<void>)
  }) {
    if ((options != null
      && options.logOptions != null
      && (options.logOptions as CustomLogger).customLogger != null)) {
      this.logger = (options!.logOptions as CustomLogger).customLogger;
    } else {
      this.logger = new Logger({
        logLevel: LogLevels.debug,
      });
    }

    this.messageProcessor = new MessageProcessor<T>({
      logger: this.logger,
      sqsOptions: options.sqsOptions,
    });
    this.jobProcessor = options.jobProcessor;
  }

  /**
   * Polls for pending jobs and processes them.
   */
  public async processPendingJobs(): Promise<number> {
    let searchCounter = 0;
    while (searchCounter !== this.maxSearches) {
      try {
        this.logger.log('Searching for sqs messages');
        const messages: T[] | void = await this
          .messageProcessor
          .getMessages()
          .catch((err: Error): void => {
            throw err;
          });
        if (messages && messages.length > 0) {
          for (const message of messages) {
            await this
              .jobProcessor(message)
              .catch((err: Error): void => {
                throw err;
              });
          }
          await this.messageProcessor.markMessagesAsProcessed({
            messages: messages,
          }).catch((err: Error): void => {
            throw err;
          });
        }
      } finally {
        searchCounter += 1;
      }
    }

    return searchCounter;
  }
}

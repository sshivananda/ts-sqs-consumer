import { SQSConsumerOptions } from './SQSConsumerOptions';
import LogLevels from './logger/LogLevels';
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

  private stopAtError: boolean = false;

  constructor(options: SQSConsumerOptions<T>) {
    this.logger = new Logger({
      logLevel: LogLevels.debug,
    });

    this.messageProcessor = new MessageProcessor<T>({
      logger: this.logger,
      sqsOptions: options.sqsOptions,
    });
    if (options.sqsOptions.receiveMessageOptions.maxSearches != null) {
      this.maxSearches = options.sqsOptions.receiveMessageOptions.maxSearches;
    }
    this.jobProcessor = options.jobProcessorOptions.jobProcessor;
    if (options.jobProcessorOptions.stopAtError != null) {
      this.stopAtError = options.jobProcessorOptions.stopAtError;
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
        const messages: T[] | void = await this
          .messageProcessor
          .getMessages()
          .catch((err: Error): void => {
            throw err;
          });
        await this
          .processAndDeleteMessages({
            messages: messages,
          })
          .catch((err: Error): void => {
            throw err;
          });
      } catch (err) {
        this.logger.log(err);
        if (this.stopAtError) {
          throw err;
        }
      } finally {
        searchCounter += 1;
      }
    }

    return searchCounter;
  }

  /**
   * Processes messages one at a time and deletes them from
   * sqs post processing
   * @param options.messages Messages to be processed and deleted from queue
   */
  private async processAndDeleteMessages(options: {
    messages: T[] | void
  }): Promise<void> {
    if (options.messages) {
      for (const message of options.messages) {
        await this
          .jobProcessor(message)
          .catch((err: Error): void => {
            throw err;
          });
      }
      await this.messageProcessor.markMessagesAsProcessed({
        messages: options.messages,
      }).catch((err: Error): void => {
        throw err;
      });
    }
  }
}

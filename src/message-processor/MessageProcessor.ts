import * as AWS from 'aws-sdk';


import { SQSOptions } from '../sqs/SQSOptions';
import { CustomSQSOptions } from '../sqs/CustomSQSOptions';
import { CustomSQS } from '../sqs/CustomSQS';
import { ReceiveMessageOptions } from '../sqs/ReceiveMessageOptions';
import { SQSMessage } from './SQSMessage';
import { ILogger } from '../logger/ILogger';

/**
 * MessageProcessor
 * Exposes implementations to handle messages that
 * signify an job
 */
export default class MessageProcessor<T extends SQSMessage> {
  // Instance of a logger object
  private readonly logger: ILogger;

  // Instance of a SQS object
  private sqsClient: AWS.SQS;

  private readonly receiveMessageOptions: ReceiveMessageOptions;

  constructor(options: {
    logger: ILogger;
    sqsOptions: SQSOptions;
  }) {
    this.logger = options.logger;
    switch (true) {
      case (options != null
        && (options.sqsOptions as CustomSQSOptions).clientOptions != null
        && (options.sqsOptions as CustomSQS).sqsClient != null):
        throw new Error('Either custom sqs objects or sqs options should be specified - but not both.');
      case (options != null
        && options.sqsOptions != null
        && (options.sqsOptions as CustomSQS).sqsClient != null):
        this.sqsClient = (options!.sqsOptions as CustomSQS).sqsClient;
        break;
      case (options != null
        && options.sqsOptions != null
        && (options.sqsOptions as CustomSQSOptions) != null):
        this.logger.log('Creating new obj');
        this.sqsClient = new AWS.SQS({
          region: (options.sqsOptions as CustomSQSOptions).clientOptions.region,
        });
        break;
      default:
        this.sqsClient = new AWS.SQS();
        break;
    }

    this.receiveMessageOptions = options.sqsOptions.receiveMessageOptions;
  }

  /**
   * getMessages
   * Retrieves message from sqs
   */
  public async getMessages(): Promise<T[] | undefined> {
    const messages: T[] = [];
    const queryOutput: AWS.SQS.Types.ReceiveMessageResult | void = await this
      .sqsClient
      .receiveMessage({
        QueueUrl: this.receiveMessageOptions.queueUrl,
        VisibilityTimeout: this.receiveMessageOptions.visibilityTimeout,
        WaitTimeSeconds: this.receiveMessageOptions.waitTimeSeconds,
        MaxNumberOfMessages: this.receiveMessageOptions.maxNumberOfMessages,
      })
      .promise()
      .catch((err: Error): void => {
        throw err;
      });
    if (queryOutput !== undefined
      && queryOutput.Messages !== undefined) {
      for (const sqsMessage of queryOutput.Messages) {
        // Adding a try catch so that a single bad message does not halt processing
        try {
          if (sqsMessage.Body !== undefined) {
            const sqsMessageData: T = <T> JSON.parse(sqsMessage.Body);
            messages.push({
              ...sqsMessageData,
              handle: sqsMessage.ReceiptHandle,
            });
          }
        } catch (err) {
          this.logger.log(err);
        }
      }
    } else {
      this.logger.log('No valid message found');
    }

    return messages;
  }

  /**
   * markMessageAsProcessed
   * Marks a message as processed
   */
  public async markMessageAsProcessed(options: {
    message: T;
  }): Promise<boolean> {
    await this
      .sqsClient
      .deleteMessage({
        QueueUrl: this.receiveMessageOptions.queueUrl,
        ReceiptHandle: options.message.handle,
      })
      .promise()
      .catch((err: Error): void => {
        throw err;
      });

    return true;
  }
}

import { SQS } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

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
  private sqsClient: SQS = new SQS();

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
        this.sqsClient = new SQS({
          region: (options.sqsOptions as CustomSQSOptions).clientOptions.region,
        });
        break;
      default:
        break;
    }

    this.receiveMessageOptions = options.sqsOptions.receiveMessageOptions;
  }

  /**
   * getMessages
   * Retrieves message from sqs
   */
  public async getMessages(): Promise<T[] | void> {
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
    return this.getValidMessages({
      queryOutput: queryOutput,
    });
  }

  /**
   * markMessageAsProcessed
   * Marks a message as processed
   */
  public async markMessagesAsProcessed(options: {
    messages: T[];
  }): Promise<boolean> {
    const deleteMessageRequest: AWS.SQS.DeleteMessageBatchRequest = {
      QueueUrl: this.receiveMessageOptions.queueUrl,
      Entries: [],
    };
    for (const message of options.messages) {
      deleteMessageRequest.Entries.push({
        Id: uuidv4(),
        ReceiptHandle: message.handle,
      });
    }
    await this
      .sqsClient
      .deleteMessageBatch(deleteMessageRequest)
      .promise()
      .catch((err: Error): void => {
        throw err;
      });

    return true;
  }

  /**
   * Given the output of sqs receive message
   * returns the list of valid messages
   * @param options.queryOutput Output of aws.sqs.receiveMessage
   */
  private async getValidMessages(options: {
    queryOutput: AWS.SQS.Types.ReceiveMessageResult | void;
  }): Promise<T[]> {
    const validMessages: T[] = [];
    if (options.queryOutput !== undefined
      && options.queryOutput.Messages !== undefined) {
      for (const sqsMessage of options.queryOutput.Messages) {
        // Adding a try catch so that a single bad message does not halt processing
        try {
          if (sqsMessage.Body !== undefined) {
            const sqsMessageData: T = <T> JSON.parse(sqsMessage.Body);
            validMessages.push({
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

    return validMessages;
  }
}

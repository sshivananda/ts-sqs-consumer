Feature: Messages that fail to be processed go to the DLQ.
SQS queues can be configured with a redrive policy
 and a dead letter queue. If a message is pulled from the queue: SQS
 makes the message invisible to other consumers. If the message is
 successfully processed - the consumer deletes the message from the queue.
 If the message is not successfully processed - consumers should not
 mark as processed, the messages remains on the queue and is made
 visible to another consumer. A redrive policy specifies the
 number of times a message can be repeat the process of being picked up
 by a consumer, failing to be processed and being made available to
 other consumers. After a messsage exceeds the maximum number of retries,
 it is sent to a dead letter queue - and can be investigated later.
 SQS consumer can be initialised with a processing function
 and a SQS queue. If the processing function fails to process some messages,
 at the end of the processing all messages in the queue should be processed
 and the messages that were not processed should be sent to the DLQ.

  Scenario: When there are errors, messages go to DLQ
    Given there are messages in sqs queue
    When ts-sqs-consumer is invoked and messages are processed with errors
    Then all messages should be processed and messages that failed processing should go to the DLQ

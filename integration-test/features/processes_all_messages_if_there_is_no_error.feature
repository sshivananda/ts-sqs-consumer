Feature: When there are no errors, processes all messages

  Scenario: When there are no errors, processes all messages
    Given there are messages in sqs queue
    When ts-sqs-consumer is invoked and messages are processed successfully
    Then all messages should be processed without any messages going to DLQ

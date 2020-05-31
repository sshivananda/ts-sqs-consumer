Feature: When there are errors, messages go to DLQ

  Scenario: When there are errors, messages go to DLQ
    Given there are messages in sqs queue
    When ts-sqs-consumer is invoked and messages are processed with errors
    Then all messages should be processed and messages should go to the DLQ

Feature: When there are no errors, processes all messages

  Scenario: When there are no errors, processes all messages
    Given there are messages in sqs queue
    When ts-sqs-consumer is invoked
    Then all messages should be processed

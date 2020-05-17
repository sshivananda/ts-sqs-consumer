export type ReceiveMessageOptions = {
  // Upper bound to the number of polls on the sqs queue
  maxSearches?: number;
  // URL of the SQS queue
  queueUrl: string;
  // this passes through to WaitTimeSeconds param of the ReceiveMessage
  // function in SQS
  // See https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html#API_ReceiveMessage_RequestParameters
  waitTimeSeconds: number;
  // this passes through to VisibilityTimeout param of the ReceiveMessage
  // function in SQS
  // See https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html#API_ReceiveMessage_RequestParameters
  visibilityTimeout: number;
  // this passes through to MaxNumberOfMessages param of the ReceiveMessage
  // function in SQS
  // See https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html#API_ReceiveMessage_RequestParameters
  maxNumberOfMessages: number;
  // Defines the behavior when fetching a message from SQS fails or parsing the message
  // to the given datatype fails
  stopAtFirstError: boolean;
};

import { CustomSQSOptions } from './CustomSQSOptions';
import { CustomSQS } from './CustomSQS';
import { ReceiveMessageOptions } from './ReceiveMessageOptions';

export type SQSOptions = (CustomSQSOptions | CustomSQS) & {
  receiveMessageOptions: ReceiveMessageOptions;
};

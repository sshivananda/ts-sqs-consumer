import { ILogger } from './ILogger';

export type LoggerOptions = {
  customLogger?: ILogger;
  verbose?: boolean;
};

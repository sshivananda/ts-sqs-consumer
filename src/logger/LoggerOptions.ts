import { ILogger } from './ILogger';
import LogLevels from './LogLevels';

export type LoggerOptions = {
  customLogger?: ILogger;
  logLevel?: LogLevels;
};

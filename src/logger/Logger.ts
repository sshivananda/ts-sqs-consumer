import winston from 'winston';

import LogLevels from './LogLevels';
import { ILogger } from './ILogger';

export default class Logger implements ILogger {
  // sets log level for the package
  private logLevel: LogLevels = LogLevels.debug;

  private loggerObj: winston.Logger;

  constructor(options: {
    logLevel?: LogLevels;
  }) {
    if (options.logLevel !== undefined) {
      this.logLevel = options.logLevel;
    }
    this.loggerObj = winston.createLogger({
      level: this.logLevel,
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  log(message: string, meta?: any): void {
    this.loggerObj.log(this.logLevel, message, meta);
  }
}

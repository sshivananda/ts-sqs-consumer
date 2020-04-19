import * as winston from 'winston';

export type LoggerOptions = {
  customLogger?: winston.Logger;
  verbose?: boolean;
};

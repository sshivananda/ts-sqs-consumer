/**
 * Interface that contains methods that shall be exposed
 * by a class that implements logging.
 */
export interface ILogger {
  log(
    message: string,
    meta?: any
  ): void;
}

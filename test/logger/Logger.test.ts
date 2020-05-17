import winston from 'winston';
import * as sinon from 'sinon';
import Logger from '../../src/logger/Logger';
import LogLevels from '../../src/logger/LogLevels';

describe('Logger', (): void => {
  describe('Object creation', (): void => {
    let createLoggerSpy: sinon.SinonSpy;
    let logSpy: sinon.SinonSpy;

    beforeEach((): void => {
      createLoggerSpy = sinon.spy(winston, 'createLogger');
      logSpy = sinon.spy(Logger.prototype, 'log');
    });

    afterEach((): void => {
      createLoggerSpy.restore();
      logSpy.restore();
    });

    it('should be able to create a new object with default options', async (): Promise<void> => {
      const logger: Logger = new Logger({});
      expect(createLoggerSpy.callCount).toBe(1);
      expect(createLoggerSpy.getCalls()[0].args[0].level).toBe('debug');
      expect(logger).toBeDefined();
      const logMessage: string = 'Test message';
      logger.log(logMessage);
      expect(logSpy.callCount).toBe(1);
      expect(logSpy.getCalls()[0].args[0]).toBe(logMessage);
    });

    it('should be able to create a new object with log level', async (): Promise<void> => {
      const logger: Logger = new Logger({
        logLevel: LogLevels.info,
      });
      expect(createLoggerSpy.callCount).toBe(1);
      expect(createLoggerSpy.getCalls()[0].args[0].level).toBe('info');
      expect(logger).toBeDefined();
      const logMessage: string = 'Test message';
      logger.log(logMessage);
      expect(logSpy.callCount).toBe(1);
      expect(logSpy.getCalls()[0].args[0]).toBe(logMessage);
    });
  });
});

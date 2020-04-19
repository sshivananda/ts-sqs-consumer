import winston from 'winston';
import * as sinon from 'sinon';

import SQSConsumer from '../src/SQSConsumer';

describe('SQSConsumer', (): void => {
  const logger: winston.Logger = winston.createLogger({
    level: 'error',
    transports: [
      new winston.transports.Console(),
    ],
  });

  describe('Object creation', (): void => {
    let createLoggerStub: sinon.SinonSpy;

    beforeEach((): void => {
      createLoggerStub = sinon.spy(winston, 'createLogger');
    });

    afterEach((): void => {
      createLoggerStub.restore();
    });

    it('should be able to create a new object of SQSConsumer with default options', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({}),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });

    it('should be able to create a new object of SQSConsumer with verbosity set', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            verbose: true,
          },
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('info');
    });

    it('should be able to create a new object of SQSConsumer with custom logger', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          logOptions: {
            customLogger: logger,
          },
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(0);
    });

    it('should be able to create a new object of SQSConsumer with max searches set', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({
          maxSearches: 10,
        }),
      ).not.toThrowError();
      expect(createLoggerStub.callCount).toBe(1);
      expect(createLoggerStub.getCalls()[0].args[0].level).toBe('debug');
    });
  });
});

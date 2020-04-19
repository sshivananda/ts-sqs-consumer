import SQSConsumer from '../src/SQSConsumer';

describe('SQSConsumer', (): void => {
  describe('Object creation', (): void => {
    it('should be able to create a new object of SQSConsumer with default options', async (): Promise<void> => {
      expect(
        (): SQSConsumer => new SQSConsumer({}),
      ).not.toThrowError();
    });
  });
});

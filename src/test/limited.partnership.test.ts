import { createLimitedPartnership } from '../service/limited-partnerships-service';
import { jest } from '@jest/globals';
import { logger } from '../utils/logger';

jest.mock('../utils/logger');

test('should call logger.info with the correct message and return the transactionId', async () => {
  const transactionId = '12345';

  const result = await createLimitedPartnership(transactionId);

  expect(result).toBe("Dummy response");
  expect(logger.info).toHaveBeenCalledWith(`Calling 'postLimitedPartnership' for transaction id '${transactionId}'`);
});


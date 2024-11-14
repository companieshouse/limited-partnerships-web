import { LimitedPartnership } from '@companieshouse/api-sdk-node/dist/services/limited-partnerships';
import { createLimitedPartnership } from '../service/limited-partnerships-service';
import { jest } from '@jest/globals';

jest.mock('../service/limited-partnerships-service');

const mockedCreateLP = createLimitedPartnership as jest.MockedFunction<(transactionId: string, data: LimitedPartnership) => Promise<string>>;

mockedCreateLP.mockReturnValue(Promise.resolve("Mocked Success"));

test('should call logger.info with the correct message and return the transactionId', async () => {
  const transactionId = '12345';
  const data: LimitedPartnership = {};

  const result = await createLimitedPartnership(transactionId, data);

  expect(result).toBe("Mocked Success");
  expect(mockedCreateLP).toHaveBeenCalledWith(transactionId, data);
});

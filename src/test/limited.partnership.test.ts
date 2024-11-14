import { createLimitedPartnership } from '../service/limited-partnerships-service';
import { jest } from '@jest/globals';

jest.mock('../service/limited-partnerships-service');

const mockedCreateLP = createLimitedPartnership as jest.MockedFunction<(transactionId: string) => Promise<string>>;

mockedCreateLP.mockReturnValue(Promise.resolve("Mocked Success"));

test('should call logger.info with the correct message and return the transactionId', async () => {
  const transactionId = '12345';

  const result = await createLimitedPartnership(transactionId);

  expect(result).toBe("Mocked Success");
  expect(mockedCreateLP).toHaveBeenCalledWith(transactionId);
});

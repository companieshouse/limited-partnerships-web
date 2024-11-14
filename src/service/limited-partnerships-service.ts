import { logger } from "../utils/logger";

export const createLimitedPartnership = async (

  transactionId: string,

): Promise<string> => {
  logger.info(`Calling 'postLimitedPartnership' for transaction id '${transactionId}'`);

  // Return a hardcoded string with await
  return await Promise.resolve("Dummy response");
};


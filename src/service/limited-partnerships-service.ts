import { logger } from "../utils/logger";

export const createLimitedPartnership = (

  transactionId: string,

): string => {
  logger.info(`Calling 'postLimitedPartnership' for transaction id '${transactionId}'`);

  // Directly return the string
  return "Dummy response";
};


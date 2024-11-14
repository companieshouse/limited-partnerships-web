import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { logger } from "../utils/logger";

export const createLimitedPartnership = async (

  transactionId: string,
  _data: LimitedPartnership
): Promise<string> => {
  logger.info(`Calling 'postLimitedPartnership' for transaction id '${transactionId}'`);

  const result = await createLimitedPartnership(transactionId, _data);

  return result;
};

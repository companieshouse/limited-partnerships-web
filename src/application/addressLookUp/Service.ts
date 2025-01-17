import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";
import ILimitedPartnershipGateway from "../../domain/ILimitedPartnershipGateway";

import { logger } from "../../utils";

class AddressLookUpService {
  constructor(
    private addressGateway: IAddressLookUpGateway,
    private limitedPartnershipGateway: ILimitedPartnershipGateway
  ) {}

  async getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership> {
    try {
      return await this.limitedPartnershipGateway.getLimitedPartnership(
        opt,
        transactionId,
        submissionId
      );
    } catch (error: any) {
      logger.error(`Error getting LimitedPartnership ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async isValidUKPostcode(postal_code: any) {
    try {
      return await this.addressGateway.isValidUKPostcode(postal_code);
    } catch (error: any) {
      logger.error(`Error validating postcode ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default AddressLookUpService;

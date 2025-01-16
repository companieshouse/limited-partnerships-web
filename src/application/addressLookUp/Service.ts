import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";
import IRegistrationGateway from "../../domain/IRegistrationGateway";

import { logger } from "../../utils";

class AddressLookUpService {
  constructor(
    private addressGateway: IAddressLookUpGateway,
    private registrationGateway: IRegistrationGateway
  ) {}

  async getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership> {
    try {
      return await this.registrationGateway.getLimitedPartnership(
        opt,
        transactionId,
        submissionId
      );
    } catch (error: any) {
      logger.error(`Error getting LimitedPartnership ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default AddressLookUpService;

import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import IGeneralPartnerGateway from "../../domain/IGeneralPartnerGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors } from "./utils";

class GeneralPartnerService {
  constructor(private generalPartnerGateway: IGeneralPartnerGateway) {}

  async createGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<{
    generalPartnerId: string;
    errors?: UIErrors;
  }> {
    try {
      const generalPartnerId = await this.generalPartnerGateway.createGeneralPartner(opt, transactionId, data);

      return { generalPartnerId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error creating general partner: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        generalPartnerId: "",
        errors
      };
    }
  }

  async getGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<GeneralPartner> {
    try {
      return await this.generalPartnerGateway.getGeneralPartner(opt, transactionId, generalPartnerId);
    } catch (error: any) {
      logger.error(`Error getting GeneralPartner ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default GeneralPartnerService;

import IGeneralPartnerGateway from "../../domain/IGeneralPartnerGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors } from "./utils";

class GeneralPartnerService {
  constructor(
    private generalPartnerGateway: IGeneralPartnerGateway
  ) {}

  async createGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<{
    generalPartnerId: string;
    errors?: UIErrors;
  }> {
    try {
      const generalPartnerId =
        await this.generalPartnerGateway.createGeneralPartner(
          opt,
          transactionId,
          data
        );

      return { generalPartnerId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(
        `Error creating transaction or submission: ${JSON.stringify(apiErrors)}`
      );

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        generalPartnerId: "",
        errors
      };
    }
  }
}

export default GeneralPartnerService;

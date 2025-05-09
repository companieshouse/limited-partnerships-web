import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import ILimitedPartnerGateway from "../../domain/ILimitedPartnerGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors } from "./utils";

class LimitedPartnerService {
  constructor(private readonly limitedPartnerGateway: ILimitedPartnerGateway) {}

  async createLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<{
    limitedPartnerId: string;
    errors?: UIErrors;
  }> {
    try {
      const limitedPartnerId = await this.limitedPartnerGateway.createLimitedPartner(opt, transactionId, data);

      return { limitedPartnerId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error creating limited partner: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        limitedPartnerId: "",
        errors
      };
    }
  }

  async getLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<LimitedPartner> {
    try {
      return await this.limitedPartnerGateway.getLimitedPartner(opt, transactionId, limitedPartnerId);
    } catch (error: any) {
      logger.error(`Error getting LimitedPartner ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async getLimitedPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<LimitedPartner[]> {
    try {
      return await this.limitedPartnerGateway.getLimitedPartners(opt, transactionId);
    } catch (error: any) {
      logger.error(`Error getting LimitedPartners ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string,
    data: Record<string, any>
  ): Promise<void | {
    errors?: UIErrors;
  }> {
    try {
      await this.limitedPartnerGateway.sendPageData(opt, transactionId, limitedPartnerId, data);
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error sending limited partner data: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        errors
      };
    }
  }
}

export default LimitedPartnerService;

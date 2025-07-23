import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import ILimitedPartnerGateway from "../../domain/ILimitedPartnerGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors, incompletePartnerErrorList } from "./utils";
import { Tokens } from "../../domain/types";

class LimitedPartnerService {
  i18n: any;

  constructor(private readonly limitedPartnerGateway: ILimitedPartnerGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async createLimitedPartner(
    opt: Tokens,
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

  async getLimitedPartner(opt: Tokens, transactionId: string, limitedPartnerId: string): Promise<LimitedPartner> {
    try {
      return await this.limitedPartnerGateway.getLimitedPartner(opt, transactionId, limitedPartnerId);
    } catch (error: any) {
      logger.error(`Error getting LimitedPartner ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async getLimitedPartners(
    opt: Tokens,
    transactionId: string
  ): Promise<{ limitedPartners: LimitedPartner[]; errors?: UIErrors }> {
    try {
      const limitedPartners = await this.limitedPartnerGateway.getLimitedPartners(opt, transactionId);

      const errorList = incompletePartnerErrorList(limitedPartners, this.i18n);

      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({ errors: errorList });

      return {
        limitedPartners,
        errors: uiErrors
      };
    } catch (error: any) {
      logger.error(`Error getting LimitedPartners ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async sendPageData(
    opt: Tokens,
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

  async deleteLimitedPartner(opt: Tokens, transactionId: string, limitedPartnerId: string) {
    try {
      await this.limitedPartnerGateway.deleteLimitedPartner(opt, transactionId, limitedPartnerId);
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error removing limited partner ${limitedPartnerId}: ${JSON.stringify(apiErrors)}`);

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

import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import IGeneralPartnerGateway from "../../domain/IGeneralPartnerGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors, incompletePartnerErrorList } from "./utils";
import { Tokens } from "../../domain/types";

class GeneralPartnerService {
  i18n: any;

  constructor(private readonly generalPartnerGateway: IGeneralPartnerGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async createGeneralPartner(
    opt: Tokens,
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

  async getGeneralPartner(opt: Tokens, transactionId: string, generalPartnerId: string): Promise<GeneralPartner> {
    try {
      return await this.generalPartnerGateway.getGeneralPartner(opt, transactionId, generalPartnerId);
    } catch (error: any) {
      logger.error(`Error getting GeneralPartner ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async getGeneralPartners(
    opt: Tokens,
    transactionId: string
  ): Promise<{ generalPartners: GeneralPartner[]; errors?: UIErrors }> {
    try {
      const generalPartners = await this.generalPartnerGateway.getGeneralPartners(opt, transactionId);

      const errorList = incompletePartnerErrorList(generalPartners, this.i18n);

      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({ errors: errorList });

      return {
        generalPartners,
        errors: uiErrors
      };
    } catch (error: any) {
      logger.error(`Error getting GeneralPartners ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async sendPageData(
    opt: Tokens,
    transactionId: string,
    generalPartnerId: string,
    data: Record<string, any>
  ): Promise<void | {
    errors?: UIErrors;
  }> {
    try {
      await this.generalPartnerGateway.sendPageData(opt, transactionId, generalPartnerId, data);
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error sending data: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        errors
      };
    }
  }

  async deleteGeneralPartner(opt: Tokens, transactionId: string, generalPartnerId: string) {
    try {
      await this.generalPartnerGateway.deleteGeneralPartner(opt, transactionId, generalPartnerId);
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error removing general partner ${generalPartnerId}: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        errors
      };
    }
  }
}

export default GeneralPartnerService;

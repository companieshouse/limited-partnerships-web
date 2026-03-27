import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { Tokens } from "../../domain/types";
import { logger } from "../../utils";
import { extractAPIErrors } from "./utils";
import UIErrors from "../../domain/entities/UIErrors";
import IPersonWithSignificantControlGateway from "../../domain/IPersonWithSignificantControlGateway";

class PersonWithSignificantControlService {
  i18n: any;

  constructor(private readonly personWithSignificantControlGateway: IPersonWithSignificantControlGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async createPersonWithSignificantControl(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<{
    personWithSignificantControlId: string;
    errors?: any;
  }> {
    try {
      const personWithSignificantControlId =
        await this.personWithSignificantControlGateway.createPersonWithSignificantControl(opt, transactionId, data);

      return { personWithSignificantControlId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error creating general partner: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        personWithSignificantControlId: "",
        errors
      };
    }
  }

  async getPersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    generalPartnerId: string
  ): Promise<PersonWithSignificantControl> {
    try {
      return await this.personWithSignificantControlGateway.getPersonWithSignificantControl(
        opt,
        transactionId,
        generalPartnerId
      );
    } catch (error: any) {
      logger.error(`Error getting PersonWithSignificantControl ${JSON.stringify(error)}`);

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
      await this.personWithSignificantControlGateway.sendPageData(opt, transactionId, generalPartnerId, data);
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
}

export default PersonWithSignificantControlService;

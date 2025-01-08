import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";

class RegistrationService {
  registrationGateway: IRegistrationGateway;

  constructor(registrationGateway: IRegistrationGateway) {
    this.registrationGateway = registrationGateway;
  }

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

  async createTransactionAndFirstSubmission(
    opt: { access_token: string; refresh_token: string },
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<{
    submissionId: string;
    transactionId: string;
    errors?: UIErrors;
  }> {
    try {
      const transactionId = await this.registrationGateway.createTransaction(
        opt,
        registrationType
      );

      const submissionId = await this.registrationGateway.createSubmission(
        opt,
        registrationType,
        transactionId,
        data
      );

      return { submissionId, transactionId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = this.extractAPIErrors(errors);

      logger.error(
        `Error creating transaction or submission: ${JSON.stringify(apiErrors)}`
      );

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        submissionId: "",
        transactionId: "",
        errors
      };
    }
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void | {
    errors?: UIErrors;
  }> {
    try {
      await this.registrationGateway.sendPageData(
        opt,
        transactionId,
        submissionId,
        registrationType,
        data
      );
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = this.extractAPIErrors(errors);

      logger.error(`Error sending data: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        errors
      };
    }
  }

  private extractAPIErrors(errors: any) {
    const isValidationErrors = errors instanceof UIErrors;
    const apiErrors = isValidationErrors ? errors.apiErrors : errors;

    return { apiErrors, isValidationErrors };
  }
}

export default RegistrationService;

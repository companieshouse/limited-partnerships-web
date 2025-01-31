import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../domain/ILimitedPartnershipGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import ITransactionGateway from "../../domain/ITransactionGateway";
import { IIncorporationGateway } from "../../domain/IIncorporationGateway";

class LimitedPartnershipService {
  constructor(
    private limitedPartnershipGateway: ILimitedPartnershipGateway,
    private transactionGateway: ITransactionGateway,
    private incorporationGateway: IIncorporationGateway
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
      const transactionId = await this.transactionGateway.createTransaction(
        opt,
        registrationType
      );

      await this.incorporationGateway.createIncorporation(
        opt,
        registrationType,
        transactionId
      );

      const submissionId =
        await this.limitedPartnershipGateway.createSubmission(
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
      await this.limitedPartnershipGateway.sendPageData(
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
    const apiErrors = isValidationErrors ? errors?.apiErrors : errors;

    return { apiErrors, isValidationErrors };
  }
}

export default LimitedPartnershipService;

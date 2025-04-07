import { IncorporationKind, LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../domain/ILimitedPartnershipGateway";
import { logger } from "../../utils";
import UIErrors from "../../domain/entities/UIErrors";
import ITransactionGateway from "../../domain/ITransactionGateway";
import { IIncorporationGateway } from "../../domain/IIncorporationGateway";
import { extractAPIErrors } from "./utils";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

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
        transactionId,
        IncorporationKind.REGISTRATION
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
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

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

  async closeTransaction(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<ApiResponse<Transaction>> {
    try {
      return await this.transactionGateway.closeTransaction(
        opt,
        transactionId
      );
    } catch (errors: any) {
      const { apiErrors } = extractAPIErrors(errors);

      logger.error(
        `Error closing transaction: ${JSON.stringify(apiErrors)}`
      );

      throw errors;
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

export default LimitedPartnershipService;

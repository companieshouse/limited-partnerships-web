import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import RegistrationPageType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import { logger } from "../../utils";

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
    errors?: CustomError[];
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
    } catch (error: any) {
      const errors = Array.isArray(error) ? error : [error];

      logger.error(
        `Error creating transaction or submission: ${JSON.stringify(errors)}`
      );

      return {
        submissionId: "",
        transactionId: "",
        errors,
      };
    }
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string,
    data: LimitedPartnership["data"]
  ): Promise<void | {
    errors?: CustomError[];
  }> {
    try {
      await this.registrationGateway.sendPageData(
        opt,
        transactionId,
        submissionId,
        data
      );
    } catch (error: any) {
      const errors = Array.isArray(error) ? error : [error];

      logger.error(`Error sending data: ${JSON.stringify(errors)}`);

      return {
        errors,
      };
    }
  }
}

export default RegistrationService;

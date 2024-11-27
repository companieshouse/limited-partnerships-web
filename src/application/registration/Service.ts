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

  getSubmissionById(id: string): Promise<LimitedPartnership> {
    return this.registrationGateway.getSubmissionById(id);
  }

  async createTransactionAndFirstSubmission(
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<{
    submissionId: string;
    transactionId: string;
    errors?: CustomError[];
  }> {
    try {
      const transactionId = await this.registrationGateway.createTransaction(
        registrationType
      );

      const submissionId = await this.registrationGateway.createSubmission(
        registrationType,
        transactionId,
        data
      );

      return { submissionId, transactionId };
    } catch (error: any) {
      const errors = !Array.isArray(error)
        ? [new CustomError("500", error.message)]
        : error;

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
}

export default RegistrationService;
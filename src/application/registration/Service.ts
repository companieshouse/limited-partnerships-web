import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import PageRegistrationType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import TransactionLimitedPartnership from "domain/entities/TransactionLimitedPartnership";

class RegistrationService {
  registrationGateway: IRegistrationGateway;

  constructor(registrationGateway: IRegistrationGateway) {
    this.registrationGateway = registrationGateway;
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    return await this.registrationGateway.getSubmissionById(id);
  }

  async createTransactionAndFirstSubmission(
    registrationType: PageRegistrationType,
    data: Record<string, any>
  ): Promise<{
    limitedPartnership: TransactionLimitedPartnership;
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

      const limitedPartnership =
        await this.registrationGateway.getSubmissionById(submissionId);

      return { limitedPartnership, submissionId, transactionId };
    } catch (errors: any) {
      return {
        limitedPartnership: {},
        submissionId: "",
        transactionId: "",
        errors,
      };
    }
  }
}

export default RegistrationService;

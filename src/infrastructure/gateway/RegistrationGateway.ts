/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PageRegistrationType from "presentation/controller/registration/PageRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";

class RegistrationGateway implements IRegistrationGateway {
  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }

  async createTransaction(pageType: PageRegistrationType): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async createTransactionAndFirstSubmission(
    pageType: PageRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationGateway;

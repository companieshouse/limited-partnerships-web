/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";

class RegistrationGateway implements IRegistrationGateway {
  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }

  async createTransaction(
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async createSubmission(
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationGateway;

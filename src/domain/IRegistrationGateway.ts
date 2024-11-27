import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../presentation/controller/registration/PageType";

interface IRegistrationGateway {
  createTransaction(
    access_token: string,
    registrationPageType: RegistrationPageType
  ): Promise<string>;
  createSubmission(
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getSubmissionById(id: string): Promise<LimitedPartnership>;
}

export default IRegistrationGateway;

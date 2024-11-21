import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../presentation/controller/registration/PageType";

interface IRegistrationGateway {
  getSubmissionById(id: string): Promise<LimitedPartnership>;
  createTransaction(
    registrationPageType: RegistrationPageType
  ): Promise<string>;
  createSubmission(
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
}

export default IRegistrationGateway;

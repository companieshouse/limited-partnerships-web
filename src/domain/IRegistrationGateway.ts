import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../presentation/controller/registration/PageType";

interface IRegistrationGateway {
  createTransaction(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType
  ): Promise<string>;
  createSubmission(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getSubmissionById(id: string): Promise<LimitedPartnership>;
  sendPageData(
    opt: { access_token: string },
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void>;
}

export default IRegistrationGateway;

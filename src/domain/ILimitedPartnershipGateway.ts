import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../presentation/controller/registration/PageType";

interface ILimitedPartnershipGateway {
  createSubmission(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership>;
  sendPageData(
    opt: { access_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void>;
}

export default ILimitedPartnershipGateway;

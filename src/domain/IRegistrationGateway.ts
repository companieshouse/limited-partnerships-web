import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PageRegistrationType from "../presentation/controller/registration/PageType";

interface IRegistrationGateway {
  getSubmissionById(id: string): Promise<LimitedPartnership>;
  createTransaction(pageType: PageRegistrationType): Promise<string>;
  createSubmission(
    pageType: PageRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
}

export default IRegistrationGateway;

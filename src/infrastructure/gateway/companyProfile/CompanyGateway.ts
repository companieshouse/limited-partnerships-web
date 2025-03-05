/* eslint-disable */
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import ICompanyGateway from "../../../domain/ICompanyGateway";

class CompanyGateway implements ICompanyGateway {
  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<Partial<CompanyProfile>> {
    throw new Error("Method not implemented.");
  }
}

export default CompanyGateway;

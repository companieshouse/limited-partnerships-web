import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

interface ICompanyGateway {
  getCompanyProfile(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    company_number: string
  ): Promise<Partial<CompanyProfile>>;
  getCompanyOfficers(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    company_number: string
  ): Promise<any>;
}

export default ICompanyGateway;

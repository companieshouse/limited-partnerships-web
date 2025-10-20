import { CompanyOfficer, CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import { Tokens } from "./types";

interface ICompanyGateway {
  getCompanyProfile(opt: Tokens, company_number: string): Promise<Partial<CompanyProfile>>;
  getCompanyOfficers(opt: Tokens, company_number: string): Promise<CompanyOfficers>;
  getCompanyAppointment(opt: Tokens, company_number: string, appointment_id: string): Promise<CompanyOfficer>;
}

export default ICompanyGateway;

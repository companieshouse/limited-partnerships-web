import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import { logger } from "../../utils";
import ICompanyGateway from "../../domain/ICompanyGateway";
import UIErrors from "../../domain/entities/UIErrors";

class CompanyService {
  constructor(private companyGateway: ICompanyGateway) {}

  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{ companyProfile: Partial<CompanyProfile>; errors?: UIErrors }> {
    try {
      const companyProfile = await this.companyGateway.getCompanyProfile(opt, company_number);
      return { companyProfile };
    } catch (error: any) {
      logger.error(`Error retrieving Company profile: ${company_number} ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default CompanyService;

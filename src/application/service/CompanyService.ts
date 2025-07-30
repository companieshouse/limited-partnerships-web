import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import { logger } from "@utils";
import ICompanyGateway from "@domain/ICompanyGateway";
import UIErrors from "@domain/entities/UIErrors";
import { extractAPIErrors } from "@service/utils";

class CompanyService {
  constructor(private readonly companyGateway: ICompanyGateway) {}

  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{ companyProfile: Partial<CompanyProfile>; errors?: UIErrors }> {
    try {
      const companyProfile = await this.companyGateway.getCompanyProfile(opt, company_number);
      return { companyProfile };
    } catch (errors: any) {
      const { isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error retrieving Company profile: ${company_number} ${JSON.stringify(errors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        companyProfile: {},
        errors
      };
    }
  }
}

export default CompanyService;

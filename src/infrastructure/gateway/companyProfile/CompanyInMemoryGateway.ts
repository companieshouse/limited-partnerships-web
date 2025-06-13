/* eslint-disable */
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import ICompanyGateway from "../../../domain/ICompanyGateway";
import UIErrors from "../../../domain/entities/UIErrors";

class CompanyInMemoryGateway implements ICompanyGateway {
  companyProfile: Partial<CompanyProfile>;

  private error = false;

  setError(value: boolean) {
    this.error = value;
  }

  feedCompanyProfile(companyProfile: Partial<CompanyProfile>): void {
    this.companyProfile = companyProfile;
  }

  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<Partial<CompanyProfile>> {
    if (this.error || company_number !== this.companyProfile.companyNumber) {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({
        errors: {
          company_number: "The partnership cannot be found"
        }
      });

      throw uiErrors;
    }

    return this.companyProfile;
  }
}

export default CompanyInMemoryGateway;

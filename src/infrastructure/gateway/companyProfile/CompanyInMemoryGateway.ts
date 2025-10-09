/* eslint-disable */
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import ICompanyGateway from "../../../domain/ICompanyGateway";
import UIErrors from "../../../domain/entities/UIErrors";
import { Tokens } from "../../../domain/types";

class CompanyInMemoryGateway implements ICompanyGateway {
  companyProfile: Partial<CompanyProfile>;
  private companyOfficers: any[] = [];

  private error = false;

  setError(value: boolean) {
    this.error = value;
  }

  feedCompanyProfile(companyProfile: Partial<CompanyProfile>): void {
    this.companyProfile = companyProfile;
  }

  feedCompanyOfficers(officers: any[]): void {
    this.companyOfficers = officers;
  }

  async getCompanyProfile(opt: Tokens, company_number: string): Promise<Partial<CompanyProfile>> {
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

  async getCompanyOfficers(opt: Tokens, company_number: string): Promise<any> {
    if (this.error || company_number !== this.companyProfile.companyNumber) {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({
        errors: {
          company_number: `Company officers cannot be found for company number ${company_number}`
        }
      });

      throw uiErrors;
    }

    return { items: this.companyOfficers };
  }
}

export default CompanyInMemoryGateway;

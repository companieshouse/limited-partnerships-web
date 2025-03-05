/* eslint-disable */
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import ICompanyGateway from "../../../domain/ICompanyGateway";
import UIErrors from "../../../domain/entities/UIErrors";

class CompanyGateway implements ICompanyGateway {
  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<Partial<CompanyProfile>> {
    if (company_number === "LP123456") {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({
        errors: {
          company_number: "The partnership cannot be found"
        }
      });

      throw uiErrors;
    }

    return {};
  }
}

export default CompanyGateway;

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Resource } from "@companieshouse/api-sdk-node";

import ICompanyGateway from "../../../domain/ICompanyGateway";
import { makeApiCallWithRetry } from "../api";
import UIErrors from "../../../domain/entities/UIErrors";

class CompanyGateway implements ICompanyGateway {
  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<CompanyProfile> {
    const apiCall = {
      service: "companyProfile",
      method: "getCompanyProfile",
      args: [company_number]
    };

    const response = await makeApiCallWithRetry<Resource<CompanyProfile>>(opt, apiCall);

    if (response.httpStatusCode === 404 || !response?.resource) {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({
        errors: {
          company_number: "The partnership cannot be found"
        }
      });

      throw uiErrors;
    }

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource;
  }
}

export default CompanyGateway;

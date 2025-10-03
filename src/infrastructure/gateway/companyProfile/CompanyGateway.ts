import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { Resource } from "@companieshouse/api-sdk-node";

import ICompanyGateway from "../../../domain/ICompanyGateway";
import { makeApiCallWithRetry } from "../api";
import UIErrors from "../../../domain/entities/UIErrors";
import { Tokens } from "../../../domain/types";

class CompanyGateway implements ICompanyGateway {
  async getCompanyProfile(opt: Tokens, company_number: string): Promise<CompanyProfile> {
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

  async getCompanyOfficers(opt: Tokens, company_number: string): Promise<CompanyOfficers> {
    const apiCall = {
      service: "companyOfficers",
      method: "getCompanyOfficers",
      args: [company_number]
    };

    const response = await makeApiCallWithRetry<Resource<any>>(opt, apiCall);

    if (response.httpStatusCode === 404 || !response?.resource) {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({
        errors: {
          company_number: `Company officers cannot be found for company number ${company_number}`
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

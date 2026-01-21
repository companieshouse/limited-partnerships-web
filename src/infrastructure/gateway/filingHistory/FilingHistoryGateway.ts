import {
  CompanyFilingHistory,
  FilingHistoryItem
} from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";
import { Resource } from "@companieshouse/api-sdk-node";

import IFilingHistory from "../../../domain/IFilingHistory";
import { Tokens } from "../../../domain/types";
import { makeApiCallWithRetry } from "../api";
import UIErrors from "../../../domain/entities/UIErrors";

class FilingHistoryGateway implements IFilingHistory {
  async getFilingHistoryList(opt: Tokens, company_number: string): Promise<FilingHistoryItem[]> {
    const apiCall = {
      service: "companyFilingHistory",
      method: "getCompanyFilingHistory",
      args: [company_number]
    };

    const response = await makeApiCallWithRetry<Resource<CompanyFilingHistory>>(opt, apiCall);

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

    return response?.resource?.items || [];
  }
}

export default FilingHistoryGateway;

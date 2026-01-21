import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

import IFilingHistory from "../../../domain/IFilingHistory";
import { Tokens } from "../../../domain/types";

class FilingHistoryGateway implements IFilingHistory {
  getFilingHistoryList(_opt: Tokens, _company_number: string): Promise<FilingHistoryItem[]> {
    throw new Error("Method not implemented.");
  }
}

export default FilingHistoryGateway;

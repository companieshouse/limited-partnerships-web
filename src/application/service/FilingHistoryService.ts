import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

import { Tokens } from "../../domain/types";
import IFilingHistory from "../../domain/IFilingHistory";

class FilingHistoryService {
  constructor(private readonly filingHistoryGateway: IFilingHistory) {}

  async getFilingHistoryList(tokens: Tokens, companyNumber: string): Promise<FilingHistoryItem[]> {
    return await this.filingHistoryGateway.getFilingHistoryList(tokens, companyNumber);
  }
}

export default FilingHistoryService;

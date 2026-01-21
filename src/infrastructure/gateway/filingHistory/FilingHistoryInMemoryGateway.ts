import {
  CompanyFilingHistory,
  FilingHistoryItem
} from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

import IFilingHistory from "../../../domain/IFilingHistory";
import { Tokens } from "../../../domain/types";

class FilingHistoryInMemoryGateway implements IFilingHistory {
  private readonly filingHistoryList: CompanyFilingHistory = {
    filingHistoryStatus: "filing-history-available-limited-partnership-from-2014",
    items: [],
    etag: "etag",
    itemsPerPage: 10,
    kind: "kind",
    startIndex: 0,
    totalCount: 10
  };

  feedFilingHistoryItems(items: FilingHistoryItem[]): void {
    this.filingHistoryList.items = items;
  }

  getFilingHistoryList(_tokens: Tokens, _companyNumber: string): Promise<FilingHistoryItem[]> {
    return Promise.resolve(this.filingHistoryList.items);
  }
}

export default FilingHistoryInMemoryGateway;

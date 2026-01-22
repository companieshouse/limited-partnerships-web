import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";
import { Tokens } from "./types";

interface IFilingHistory {
  getFilingHistoryList(opt: Tokens, companyNumber: string): Promise<FilingHistoryItem[]>;
}

export default IFilingHistory;

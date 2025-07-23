import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { Tokens } from "./types";

interface IGeneralPartnerGateway {
  createGeneralPartner(opt: Tokens, transactionId: string, data: Record<string, any>): Promise<string>;
  getGeneralPartners(opt: Tokens, transactionId: string): Promise<GeneralPartner[]>;
  getGeneralPartner(opt: Tokens, transactionId: string, generalPartnerId: string): Promise<GeneralPartner>;
  sendPageData(opt: Tokens, transactionId: string, generalPartnerId: string, data: Record<string, any>): Promise<void>;
  deleteGeneralPartner(opt: Tokens, transactionId: string, generalPartnerId: string): Promise<void>;
}

export default IGeneralPartnerGateway;

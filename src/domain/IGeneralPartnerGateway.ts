import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

interface IGeneralPartnerGateway {
  createGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getGeneralPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<GeneralPartner[]>;
  getGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<GeneralPartner>;
  sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string,
    data: Record<string, any>
  ): Promise<void>;
  removeGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<void>;
}

export default IGeneralPartnerGateway;

import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

interface ILimitedPartnerGateway {
  createLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<LimitedPartner>;
  getLimitedPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<LimitedPartner[]>;
  sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string,
    data: Record<string, any>
  ): Promise<void>;
  deleteLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<void>;
}

export default ILimitedPartnerGateway;

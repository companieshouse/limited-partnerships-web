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
  sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string,
    data: Record<string, any>
  ): Promise<void>;

  // COMMENTED OUT FOR NOW DUE TO SONARQUBE ISSUES

  // getLimitedPartners(
  //   opt: { access_token: string; refresh_token: string },
  //   transactionId: string
  // ): Promise<LimitedPartner[]>;
}

export default ILimitedPartnerGateway;

interface IGeneralPartnerGateway {
  createGeneralPartner(
    opt: { access_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  getGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  );
}

export default IGeneralPartnerGateway;

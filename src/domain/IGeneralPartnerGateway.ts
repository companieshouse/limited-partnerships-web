interface IGeneralPartnerGateway {
  createGeneralPartner(
    opt: { access_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
}

export default IGeneralPartnerGateway;

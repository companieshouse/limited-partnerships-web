import IGeneralPartnerGateway from "../../../domain/IGeneralPartnerGateway";

class GeneralPartnerGateway implements IGeneralPartnerGateway {
  async createGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    // TODO Remove this output when parameters are used in the call to the SDK (added to address lint error)
    console.log(opt);
    console.log(transactionId);
    console.log(data);

    // TODO Return a new general partner id when gateway calls the SDK
    return await "GENERAL-PARTNER-ID";
  }
}

export default GeneralPartnerGateway;

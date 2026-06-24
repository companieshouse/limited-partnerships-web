import ISicCodesGateway from "../../../domain/ISicCodesGateway";

class SicCodesGateway implements ISicCodesGateway {
  private sicCodes: { sic_code: string; sic_description: string }[] = [];

  public feedSicCodes(sicCodes: { sic_code: string; sic_description: string }[]): void {
    this.sicCodes = sicCodes;
  }

  public async getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]> {
    return await Promise.resolve(this.sicCodes);
  }
}

export default SicCodesGateway;

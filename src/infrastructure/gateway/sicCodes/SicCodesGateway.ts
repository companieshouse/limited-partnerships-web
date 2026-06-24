import ISicCodesGateway from "../../../domain/ISicCodesGateway";

class SicCodesGateway implements ISicCodesGateway {
  async getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]> {
    return await Promise.resolve([
      { sic_code: "12345", sic_description: "SIC Code 12345" },
      { sic_code: "56789", sic_description: "SIC Code 56789" },
      { sic_code: "91011", sic_description: "SIC Code 91011" },
      { sic_code: "12131", sic_description: "SIC Code 12131" }
    ]);
  }
}

export default SicCodesGateway;

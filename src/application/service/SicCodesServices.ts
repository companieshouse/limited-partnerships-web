class SicCodesService {
  constructor(private readonly sicCodesGateway: any) {}

  getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]> {
    return this.sicCodesGateway.getSicCodes();
  }
}

export default SicCodesService;

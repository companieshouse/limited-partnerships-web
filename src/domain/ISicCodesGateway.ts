interface ISicCodesGateway {
  getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]>;
}

export default ISicCodesGateway;

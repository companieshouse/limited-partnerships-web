import Address from "./entities/Address";

interface IAddressLookUpGateway {
  isValidUKPostcode(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<boolean>;

  getListOfValidPostcodeAddresses(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<Address[]>;
}

export default IAddressLookUpGateway;

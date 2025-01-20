import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";

interface IAddressLookUpGateway {
  isValidUKPostcode(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<boolean>;

  getListOfValidPostcodeAddresses(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<UKAddress[]>;
}

export default IAddressLookUpGateway;

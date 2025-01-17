import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";

interface IAddressLookUpGateway {
  isValidUKPostcode(postcode: string): Promise<boolean>;

  getListOfValidPostcodeAddresses(postcode: string): Promise<UKAddress[]>;
}

export default IAddressLookUpGateway;

import { Resource } from "@companieshouse/api-sdk-node";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";

interface IAddressLookUpGateway {
  isValidUKPostcode(
    postcodeValidationUrl: string,
    postcode: string
  ): Promise<boolean>;

  getListOfValidPostcodeAddresses(
    postcodeAddressesLookupUrl: string,
    postcode: string
  ): Promise<Resource<UKAddress[]>>;
}

export default IAddressLookUpGateway;

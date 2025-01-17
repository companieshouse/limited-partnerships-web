import { Resource } from "@companieshouse/api-sdk-node";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";

interface IAddressLookUpGateway {
  isValidUKPostcode(postcode: string): Promise<boolean>;

  getListOfValidPostcodeAddresses(
    postcode: string
  ): Promise<Resource<UKAddress[]>>;
}

export default IAddressLookUpGateway;

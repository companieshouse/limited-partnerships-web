/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";

class AddressLookUpInMemoryGateway implements IAddressLookUpGateway {
  postcode: string = "CF14 3UZ";

  async isValidUKPostcode(postcode: string): Promise<boolean> {
    if (postcode === this.postcode) return true;

    return false;
  }
  async getListOfValidPostcodeAddresses(
    postcode: string
  ): Promise<Resource<UKAddress[]>> {
    throw new Error("Method not implemented.");
  }
}

export default AddressLookUpInMemoryGateway;

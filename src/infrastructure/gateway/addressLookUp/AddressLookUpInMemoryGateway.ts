/* eslint-disable */

import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";

class AddressLookUpInMemoryGateway implements IAddressLookUpGateway {
  address: UKAddress = {
    postcode: "CF14 3UZ",
    addressLine1: "CROWN WAY",
    addressLine2: "",
    postTown: "CARDIFF",
    country: "GB-WLS",
    premise: ""
  };

  async isValidUKPostcode(postcode: string): Promise<boolean> {
    if (postcode === this.address.postcode) return true;

    return false;
  }

  async getListOfValidPostcodeAddresses(
    postcode: string
  ): Promise<UKAddress[]> {
    if (postcode === this.address.postcode) {
      return [this.address];
    }

    return [];
  }
}

export default AddressLookUpInMemoryGateway;

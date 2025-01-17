/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";

class AddressLookUpGateway implements IAddressLookUpGateway {
  async isValidUKPostcode(postcode: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async getListOfValidPostcodeAddresses(
    postcode: string
  ): Promise<Resource<UKAddress[]>> {
    throw new Error("Method not implemented.");
  }
}

export default AddressLookUpGateway;

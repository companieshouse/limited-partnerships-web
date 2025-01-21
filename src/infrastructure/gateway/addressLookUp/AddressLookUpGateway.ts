/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../../config/constants";
import { makeApiCallWithRetry } from "../api";

class AddressLookUpGateway implements IAddressLookUpGateway {
  SDK_POSTCODE_LOOKUP_SERVICE = "postCodeLookup";

  async isValidUKPostcode(
    opt: { access_token: string; refresh_token: string },
    postalCode: string
  ): Promise<boolean> {
    const apiCall = {
      service: this.SDK_POSTCODE_LOOKUP_SERVICE,
      method: "isValidUKPostcode",
      args: [
        `${POSTCODE_ADDRESSES_LOOKUP_URL}/postcode`,
        this.removeSpaceFromPostalCode(postalCode)
      ]
    };

    return makeApiCallWithRetry<boolean>(opt, apiCall);
  }

  async getListOfValidPostcodeAddresses(
    opt: { access_token: string; refresh_token: string },
    postalCode: string
  ): Promise<UKAddress[]> {
    const apiCall = {
      service: this.SDK_POSTCODE_LOOKUP_SERVICE,
      method: "getListOfValidPostcodeAddresses",
      args: [
        `${POSTCODE_ADDRESSES_LOOKUP_URL}/multiple-addresses`,
        this.removeSpaceFromPostalCode(postalCode)
      ]
    };

    const response = await makeApiCallWithRetry<Resource<UKAddress[]>>(
      opt,
      apiCall
    );

    return response?.resource ?? [];
  }

  private removeSpaceFromPostalCode(postalCode: string) {
    return postalCode ? postalCode.replace(/\s+/g, "") : "";
  }
}

export default AddressLookUpGateway;

/* eslint-disable */

import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";

class AddressLookUpInMemoryGateway implements IAddressLookUpGateway {
  addresses: UKAddress[] = [
    {
      postcode: "ST6 3LJ",
      premise: "2",
      addressLine1: "DUNCALF STREET",
      addressLine2: "",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    },
    {
      postcode: "ST6 3LJ",
      premise: "6",
      addressLine1: "DUNCALF STREET",
      addressLine2: "",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    },
    {
      postcode: "ST6 3LJ",
      premise: "4",
      addressLine1: "DUNCALF STREET",
      addressLine2: "",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    },
    {
      postcode: "ST6 3LJ",
      premise: "THE LODGE",
      addressLine1: "DUNCALF STREET",
      addressLine2: "CASTLE HILL",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    }
  ];

  scotlandAddresses: UKAddress[] = [
    {
      postcode: "IV18 0JT",
      premise: "1",
      addressLine1: "MAIN AVENUE",
      addressLine2: "",
      postTown: "INVERGORDON",
      country: "GB-SCT"
    }
  ];

  error = false;

  async isValidUKPostcode(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<boolean> {
    return (
      postcode === this.addresses[0].postcode ||
      postcode === this.scotlandAddresses[0].postcode
    );
  }

  async getListOfValidPostcodeAddresses(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<UKAddress[]> {
    if (this.error) {
      throw new Error('Test 500 error');
    }

    if (postcode === this.addresses[0].postcode) {
      return this.addresses;
    }

    if (postcode === this.scotlandAddresses[0].postcode) {
      return this.scotlandAddresses;
    }

    return [];
  }
}

export default AddressLookUpInMemoryGateway;

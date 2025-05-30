/* eslint-disable */

import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";
import postcodeLookUpAddressToAddress from "./addressMapper";
import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

class AddressLookUpInMemoryGateway implements IAddressLookUpGateway {
  englandAddresses: UKAddress[] = englandAddresses;
  walesAddresses: UKAddress[] = walesAddresses;
  scotlandAddresses: UKAddress[] = scotlandAddresses;
  borderAddresses: UKAddress[] = borderAddresses;
  northernIrelandAddresses: UKAddress[] = northernIrelandAddresses;

  error = false;

  setError(value: boolean) {
    this.error = value;
  }

  async isValidUKPostcode(opt: { access_token: string; refresh_token: string }, postcode: string): Promise<boolean> {
    return (
      this.isSamePostalCode(postcode, this.englandAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.walesAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.scotlandAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.borderAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.northernIrelandAddresses[0].postcode)
    );
  }

  async getListOfValidPostcodeAddresses(
    opt: { access_token: string; refresh_token: string },
    postcode: string
  ): Promise<Address[]> {
    if (this.error) {
      throw new Error("Test 500 error");
    }

    if (this.isSamePostalCode(postcode, this.englandAddresses[0].postcode)) {
      return this.englandAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.walesAddresses[0].postcode)) {
      return this.walesAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.scotlandAddresses[0].postcode)) {
      return this.scotlandAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.borderAddresses[0].postcode)) {
      return this.borderAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.northernIrelandAddresses[0].postcode)) {
      return this.northernIrelandAddresses.map(postcodeLookUpAddressToAddress);
    }

    return [];
  }

  private isSamePostalCode(postalCode: string, postalCodeToCompare: string) {
    return postalCode.replace(/\s+/g, "").toLowerCase() === postalCodeToCompare.replace(/\s+/g, "").toLowerCase();
  }
}

export default AddressLookUpInMemoryGateway;

const englandAddresses: UKAddress[] = [
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
    addressLine1: "DUNCALF'S STREET",
    addressLine2: "CASTLE HILL",
    postTown: "STOKE-ON-TRENT",
    country: "GB-ENG"
  }
];

const walesAddresses: UKAddress[] = [
  {
    postcode: "CF3 0AD",
    premise: "261",
    addressLine1: "OAKLANDS CLOSE",
    addressLine2: "",
    postTown: "CARDIFF",
    country: "GB-WLS"
  }
];

const scotlandAddresses: UKAddress[] = [
  {
    postcode: "IV18 0JT",
    premise: "1",
    addressLine1: "MAIN AVENUE",
    addressLine2: "",
    postTown: "INVERGORDON",
    country: "GB-SCT"
  }
];

const borderAddresses: UKAddress[] = [
  {
    postcode: "SY1 1EB",
    premise: "10",
    addressLine1: "ST MARYS STREET",
    addressLine2: "",
    postTown: "SHREWSBURY",
    country: ""
  }
];

const northernIrelandAddresses: UKAddress[] = [
  {
    postcode: "BT12 6QH",
    premise: "11E",
    addressLine1: "GLENMACHAN CLOSE",
    addressLine2: "",
    postTown: "BELFAST",
    country: "GB-NIR"
  }
];

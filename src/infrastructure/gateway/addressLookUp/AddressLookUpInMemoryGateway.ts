/* eslint-disable */

import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import IAddressLookUpGateway from "../../../domain/IAddressLookUpGateway";
import postcodeLookUpAddressToAddress from "./addressMapper";
import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

class AddressLookUpInMemoryGateway implements IAddressLookUpGateway {
  englandAddresses: UKAddress[] = englandAddressList;
  walesAddresses: UKAddress[] = walesAddressList;
  scotlandAddresses: UKAddress[] = scotlandAddressList;
  borderAddresses: UKAddress[] = borderAddressList;
  northernIrelandAddresses: UKAddress[] = northernIrelandAddressList;
  jerseyAddresses: UKAddress[] = jerseyAddressList;
  guernseyAddresses: UKAddress[] = guernseyAddressList;
  isleOfManAddresses: UKAddress[] = isleOfManAddressList;

  error = false;

  setError(value: boolean) {
    this.error = value;
  }

  feedEnglandAddresses(addresses: UKAddress[]) {
    this.englandAddresses = addresses;
  }

  async isValidUKPostcode(opt: { access_token: string; refresh_token: string }, postcode: string): Promise<boolean> {
    return (
      this.isSamePostalCode(postcode, this.englandAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.walesAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.scotlandAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.borderAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.northernIrelandAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.jerseyAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.guernseyAddresses[0].postcode) ||
      this.isSamePostalCode(postcode, this.isleOfManAddresses[0].postcode)
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

    if (this.isSamePostalCode(postcode, this.jerseyAddresses[0].postcode)) {
      return this.jerseyAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.guernseyAddresses[0].postcode)) {
      return this.guernseyAddresses.map(postcodeLookUpAddressToAddress);
    }

    if (this.isSamePostalCode(postcode, this.isleOfManAddresses[0].postcode)) {
      return this.isleOfManAddresses.map(postcodeLookUpAddressToAddress);
    }

    return [];
  }

  private isSamePostalCode(postalCode: string, postalCodeToCompare: string) {
    return postalCode.replace(/\s+/g, "").toLowerCase() === postalCodeToCompare.replace(/\s+/g, "").toLowerCase();
  }
}

export default AddressLookUpInMemoryGateway;

export const englandAddressList: UKAddress[] = [
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

const walesAddressList: UKAddress[] = [
  {
    postcode: "CF3 0AD",
    premise: "261",
    addressLine1: "OAKLANDS CLOSE",
    addressLine2: "",
    postTown: "CARDIFF",
    country: "GB-WLS"
  }
];

const scotlandAddressList: UKAddress[] = [
  {
    postcode: "IV18 0JT",
    premise: "1",
    addressLine1: "MAIN AVENUE",
    addressLine2: "",
    postTown: "INVERGORDON",
    country: "GB-SCT"
  }
];

const borderAddressList: UKAddress[] = [
  {
    postcode: "SY1 1EB",
    premise: "10",
    addressLine1: "ST MARYS STREET",
    addressLine2: "",
    postTown: "SHREWSBURY",
    country: ""
  }
];

const northernIrelandAddressList: UKAddress[] = [
  {
    postcode: "BT12 6QH",
    premise: "11E",
    addressLine1: "GLENMACHAN CLOSE",
    addressLine2: "",
    postTown: "BELFAST",
    country: "GB-NIR"
  }
];

const jerseyAddressList: UKAddress[] = [
  {
    postcode: "JE2 3AA",
    premise: "9 HELIER LES VANNIERS",
    addressLine1: "LA ROUTE DE ST. AUBIN",
    addressLine2: "",
    postTown: "JERSEY",
    country: "Channel Island"
  }
];

const guernseyAddressList: UKAddress[] = [
  {
    postcode: "GY1 2AL",
    premise: "1",
    addressLine1: "LA ROUTE DE ST. AUBIN",
    addressLine2: "",
    postTown: "GUERNSEY",
    country: "Channel Island"
  }
];

const isleOfManAddressList: UKAddress[] = [
  {
    postcode: "IM2 4NN",
    premise: "1",
    addressLine1: "LANSDOWNE",
    addressLine2: "",
    postTown: "ISLE OF MAN",
    country: "Isle of Man"
  }
];

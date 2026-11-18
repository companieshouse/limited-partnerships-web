import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import postcodeLookUpAddressToAddress from "../../../../infrastructure/gateway/addressLookUp/addressMapper";

describe("Address mapper", () => {
  const ukAddress = (country: string): UKAddress => ({
    postcode: "SY1 1EB",
    premise: "10",
    addressLine1: "ST MARYS STREET",
    addressLine2: "",
    postTown: "SHREWSBURY",
    country
  });

  it.each([
    ["GB-ENG", "England"],
    ["GB-WLS", "Wales"],
    ["border", ""],
    ["Channel Island", "Channel Island"]
  ])("should map country code %s to %s", (countryCode: string, expected: string) => {
    expect(postcodeLookUpAddressToAddress(ukAddress(countryCode)).country).toEqual(expected);
  });
});

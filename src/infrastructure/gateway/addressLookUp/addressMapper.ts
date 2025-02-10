import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

const postcodeLookUpAddressToAddress = (address: UKAddress): Address => {
  return {
    address_line_1: address.addressLine1,
    address_line_2: address.addressLine2,
    country: address.country,
    locality: address.postTown,
    postal_code: address.postcode,
    premises: address.premise
  };
};

export default postcodeLookUpAddressToAddress;

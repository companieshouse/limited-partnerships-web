import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";
import ILimitedPartnershipGateway from "../../domain/ILimitedPartnershipGateway";

import { logger } from "../../utils";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

class AddressLookUpService {
  constructor(
    private addressGateway: IAddressLookUpGateway,
    private limitedPartnershipGateway: ILimitedPartnershipGateway
  ) {}

  async isValidUKPostcodeAndHasAnAddress(
    opt: { access_token: string; refresh_token: string },
    postalCode: string,
    addressLine1?: string
  ): Promise<{
    isValid: boolean;
    address: UKAddress;
  }> {
    try {
      const address: UKAddress = {
        postcode: postalCode,
        addressLine1: "",
        addressLine2: "",
        postTown: "",
        country: "",
        premise: ""
      };

      const isValid = await this.addressGateway.isValidUKPostcode(
        opt,
        postalCode
      );

      if (isValid && addressLine1) {
        const ukAddresses: UKAddress[] =
          await this.addressGateway.getListOfValidPostcodeAddresses(
            opt,
            postalCode
          );

        if (ukAddresses.length === 0) {
          return {
            isValid,
            address
          };
        }

        const matchingAddress = ukAddresses.find(
          (ukAddress) =>
            ukAddress.postcode === postalCode &&
            ukAddress.addressLine1 === addressLine1
        );

        if (matchingAddress) {
          return { isValid, address: matchingAddress };
        }
      }

      return {
        isValid,
        address
      };
    } catch (error: any) {
      logger.error(`Error validating postcode ${JSON.stringify(error)}`);

      throw error;
    }
  }

  private;
}

export default AddressLookUpService;

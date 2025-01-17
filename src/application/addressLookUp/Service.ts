import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";
import ILimitedPartnershipGateway from "../../domain/ILimitedPartnershipGateway";

import { logger } from "../../utils";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

class AddressLookUpService {
  constructor(
    private addressGateway: IAddressLookUpGateway,
    private limitedPartnershipGateway: ILimitedPartnershipGateway
  ) {}

  async getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership> {
    try {
      return await this.limitedPartnershipGateway.getLimitedPartnership(
        opt,
        transactionId,
        submissionId
      );
    } catch (error: any) {
      logger.error(`Error getting LimitedPartnership ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async isValidUKPostcodeAndHasAnAddress(
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

      const isValid = await this.addressGateway.isValidUKPostcode(postalCode);

      if (isValid && addressLine1) {
        const ukAddresses: UKAddress[] =
          await this.addressGateway.getListOfValidPostcodeAddresses(postalCode);

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

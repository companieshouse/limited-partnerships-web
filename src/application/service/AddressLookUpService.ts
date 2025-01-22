import UIErrors from "../../domain/entities/UIErrors";
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
    premise?: string
  ): Promise<{
    isValid: boolean;
    address: UKAddress;
    errors?: UIErrors;
  }> {
    try {
      let errors: UIErrors | undefined;

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

      if (!isValid) {
        const uiErrors = new UIErrors();
        uiErrors.formatValidationErrorToUiErrors({
          errors: {
            postal_code: `The postcode ${postalCode} cannot be found`
          }
        });

        errors = uiErrors;
      }

      if (isValid && premise) {
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
            ukAddress.postcode === postalCode && ukAddress.premise === premise
        );

        if (matchingAddress) {
          return { isValid, address: matchingAddress };
        }
      }

      return {
        isValid,
        address,
        errors
      };
    } catch (error: any) {
      logger.error(`Error validating postcode ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default AddressLookUpService;

import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../../domain/entities/UIErrors";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";

import { logger } from "../../utils";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

class AddressLookUpService {
  constructor(private addressGateway: IAddressLookUpGateway) {}

  async isValidUKPostcodeAndHasAnAddress(
    opt: { access_token: string; refresh_token: string },
    partnershipType: string,
    postalCode: string,
    premise?: string
  ): Promise<{
    address: UKAddress;
    errors?: UIErrors;
  }> {
    try {
      const uiErrors = new UIErrors();

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
        this.setPostalCodeError(
          uiErrors,
          `The postcode ${postalCode} cannot be found`
        );

        return { address, errors: uiErrors };
      }

      const ukAddresses: UKAddress[] =
        await this.getAddressListForPostcode(
          opt,
          postalCode
        );

      if (!this.isFromCorrectCountry(partnershipType, ukAddresses, uiErrors)) {
        return { address, errors: uiErrors };
      }

      if (premise) {
        if (ukAddresses.length === 0) {
          return { address };
        }

        const matchingAddress = ukAddresses.find(
          (ukAddress) =>
            ukAddress.postcode === postalCode && ukAddress.premise === premise
        );

        if (matchingAddress) {
          return { address: matchingAddress };
        }
      }

      return { address };
    } catch (error: any) {
      logger.error(`Error validating postcode ${JSON.stringify(error)}`);

      throw error;
    }
  }

  isValidJurisdictionAndCountry(
    jurisdiction: string,
    country: string
  ): {
    isValid: boolean;
    errors?: UIErrors;
  } {
    try {
      const uiErrors = new UIErrors();

      if (!this.isJurisdictionAndCountryCombinationAllowed(jurisdiction, country, uiErrors)) {
        return { isValid: false, errors: uiErrors };
      }

      return { isValid: true };
    } catch (error: any) {
      logger.error(`Error validating jurisdiction and country ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async getAddressListForPostcode(
    opt: { access_token: string; refresh_token: string },
    postalCode: string,
  ): Promise<UKAddress[]> {
    try {
      const addressList: UKAddress[] = await this.addressGateway.getListOfValidPostcodeAddresses(
        opt,
        postalCode
      );

      return addressList.sort((a, b) => a.premise.localeCompare(b.premise));

    } catch (error: any) {
      logger.error(`Error retrieving address list for postcode ${postalCode} ${JSON.stringify(error)}`);

      throw error;
    }
  }

  private isFromCorrectCountry(
    partnershipType: string,
    ukAddresses: UKAddress[],
    uiErrors: UIErrors
  ): boolean {
    let isCorrectCountry = true;

    const SCOTLAND = ["GB-SCT", "DG", "NE", "CA", "TD"];
    const IS_IN_SCOTLAND = SCOTLAND.includes(ukAddresses[0]?.country);
    const SCOTLAND_TYPE =
      partnershipType === PartnershipType.SLP ||
      partnershipType === PartnershipType.SPFLP;
    const NON_SCOTLAND_TYPE =
      partnershipType === PartnershipType.LP ||
      partnershipType === PartnershipType.PFLP;

    if (SCOTLAND_TYPE && !IS_IN_SCOTLAND) {
      isCorrectCountry = false;

      this.setPostalCodeError(
        uiErrors,
        "You must enter a postcode which is in Scotland"
      );
    } else if (NON_SCOTLAND_TYPE && IS_IN_SCOTLAND) {
      isCorrectCountry = false;

      this.setPostalCodeError(
        uiErrors,
        "You must enter a postcode which is in England, Wales, or Northern Ireland"
      );
    }

    return isCorrectCountry;
  }

  private setPostalCodeError(uiErrors: UIErrors, message: string): void {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        postal_code: message
      }
    });
  }

  private isJurisdictionAndCountryCombinationAllowed(
    jurisdiction: string,
    country: string,
    uiErrors: UIErrors
  ): boolean {

    const isValid = (jurisdiction === Jurisdiction.SCOTLAND && country === "scotland")
      || (jurisdiction === Jurisdiction.NORTHERN_IRELAND && country === "northern-ireland")
      || (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && (country === "england" || country === "wales"));

    if (!isValid) {
      this.setCountryError(
        uiErrors,
        "You must enter a country that matches your jurisdiction"
      );
    }

    return isValid;
  }

  private setCountryError(uiErrors: UIErrors, message: string): void {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        country: message
      }
    });
  }
}

export default AddressLookUpService;

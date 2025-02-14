import { Address, Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../../domain/entities/UIErrors";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";

import { logger } from "../../utils";

class AddressLookUpService {
  constructor(private addressGateway: IAddressLookUpGateway) {}

  async isValidUKPostcodeAndHasAnAddress(
    opt: { access_token: string; refresh_token: string },
    partnershipType: string,
    postalCode: string,
    premises?: string
  ): Promise<{
    address: Address;
    errors?: UIErrors;
  }> {
    try {
      const uiErrors = new UIErrors();

      const address: Address = {
        postal_code: postalCode,
        address_line_1: "",
        address_line_2: "",
        locality: "",
        country: "",
        premises: ""
      };

      const isValid = await this.addressGateway.isValidUKPostcode(
        opt,
        postalCode
      );

      if (!isValid) {
        this.setFieldError(
          uiErrors,
          "postal_code",
          `The postcode ${postalCode} cannot be found`
        );

        return { address, errors: uiErrors };
      }

      const ukAddresses: Address[] = await this.getAddressListForPostcode(
        opt,
        postalCode
      );

      if (!this.isFromCorrectCountry(partnershipType, ukAddresses, uiErrors)) {
        return { address, errors: uiErrors };
      }

      if (premises) {
        if (ukAddresses.length === 0) {
          return { address };
        }

        const matchingAddress = ukAddresses.find(
          (ukAddress) =>
            ukAddress.postal_code === postalCode &&
            ukAddress.premises === premises
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
  ): UIErrors | undefined {
    const uiErrors = new UIErrors();

    if (!this.isJurisdictionAndCountryCombinationAllowed(jurisdiction, country, uiErrors)) {
      return uiErrors;
    }
  }

  async getAddressListForPostcode(
    opt: { access_token: string; refresh_token: string },
    postalCode: string
  ): Promise<Address[]> {
    try {
      const addressList: Address[] =
        await this.addressGateway.getListOfValidPostcodeAddresses(
          opt,
          postalCode
        );

      return addressList.sort((a, b) => a.premises.localeCompare(b.premises));
    } catch (error: any) {
      logger.error(
        `Error retrieving address list for postcode ${postalCode} ${JSON.stringify(
          error
        )}`
      );

      throw error;
    }
  }

  private isFromCorrectCountry(
    partnershipType: string,
    ukAddresses: Address[],
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

      this.setFieldError(
        uiErrors,
        "postal_code",
        "You must enter a postcode which is in Scotland"
      );
    } else if (NON_SCOTLAND_TYPE && IS_IN_SCOTLAND) {
      isCorrectCountry = false;

      this.setFieldError(
        uiErrors,
        "postal_code",
        "You must enter a postcode which is in England, Wales, or Northern Ireland"
      );
    }

    return isCorrectCountry;
  }

  private setFieldError(uiErrors: UIErrors, fieldName: string, message: string): void {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        [fieldName]: message
      }
    });
  }

  private isJurisdictionAndCountryCombinationAllowed(
    jurisdiction: string,
    country: string,
    uiErrors: UIErrors
  ): boolean {

    const isValid = (jurisdiction === Jurisdiction.SCOTLAND && country === "GB-SCT")
      || (jurisdiction === Jurisdiction.NORTHERN_IRELAND && country === "GB-NIR")
      || (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && (country === "GB-ENG" || country === "GB-WLS"));

    if (!isValid) {
      this.setFieldError(
        uiErrors,
        "country",
        "You must enter a country that matches your jurisdiction"
      );
    }

    return isValid;
  }
}

export default AddressLookUpService;

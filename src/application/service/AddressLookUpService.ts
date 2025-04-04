import { Address, Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../../domain/entities/UIErrors";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";

import { logger } from "../../utils";

class AddressLookUpService {
  i18n: any;

  constructor(private addressGateway: IAddressLookUpGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async isValidUKPostcodeAndHasAnAddress(
    opt: { access_token: string; refresh_token: string },
    jurisdiction: string,
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

      const isValid = await this.addressGateway.isValidUKPostcode(opt, postalCode);

      if (!isValid) {
        this.setFieldError(uiErrors, "postal_code", `The postcode ${postalCode} cannot be found`);

        return { address, errors: uiErrors };
      }

      const ukAddresses: Address[] = await this.getAddressListForPostcode(opt, postalCode);

      if (!this.isFromCorrectCountry(jurisdiction, ukAddresses, uiErrors)) {
        return { address, errors: uiErrors };
      }

      if (premises) {
        if (ukAddresses.length === 0) {
          return { address };
        }

        const matchingAddress = this.getMatchingAddress(ukAddresses, postalCode, premises);

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

  private getMatchingAddress(ukAddresses: Address[], postalCode: string, premises: string) {
    return ukAddresses.find(
      (ukAddress) =>
        ukAddress.postal_code.replace(/\s+/g, "").toLowerCase() === postalCode.replace(/\s+/g, "").toLowerCase() &&
        ukAddress.premises.toLowerCase() === premises.toLowerCase()
    );
  }

  isValidJurisdictionAndCountry(jurisdiction: string, country: string): UIErrors | undefined {
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
      const addressList: Address[] = await this.addressGateway.getListOfValidPostcodeAddresses(opt, postalCode);

      return addressList.sort((a, b) => a.premises.localeCompare(b.premises));
    } catch (error: any) {
      logger.error(`Error retrieving address list for postcode ${postalCode} ${JSON.stringify(error)}`);

      throw error;
    }
  }

  private isFromCorrectCountry(jurisdiction: string, ukAddresses: Address[], uiErrors: UIErrors): boolean {
    let isCorrectCountry = true;

    const IS_BORDER = ukAddresses[0]?.country === "border";
    const ENGLAND = ["England", "Channel Island", "Isle of Man"];
    const IS_IN_ENGLAND = ENGLAND.includes(ukAddresses[0]?.country);
    const IS_IN_WALES = ukAddresses[0]?.country === "Wales";
    const IS_IN_SCOTLAND = ukAddresses[0]?.country === "Scotland";
    const IS_IN_NORTHERN_IRELAND = ukAddresses[0]?.country === "Northern Ireland";

    if (IS_BORDER || ukAddresses[0]?.country === "") {
      return isCorrectCountry;
    }

    if (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && !IS_IN_ENGLAND && !IS_IN_WALES) {
      isCorrectCountry = false;

      this.setFieldError(
        uiErrors,
        "postal_code",
        this.i18n?.address?.findPostcode?.errorMessages?.jurisdictionEnglandAndWales
      );
    } else if (jurisdiction === Jurisdiction.SCOTLAND && !IS_IN_SCOTLAND) {
      isCorrectCountry = false;

      this.setFieldError(
        uiErrors,
        "postal_code",
        this.i18n?.address?.findPostcode?.errorMessages?.jurisdictionScotland
      );
    } else if (jurisdiction === Jurisdiction.NORTHERN_IRELAND && !IS_IN_NORTHERN_IRELAND) {
      isCorrectCountry = false;

      this.setFieldError(
        uiErrors,
        "postal_code",
        this.i18n?.address?.findPostcode?.errorMessages?.jurisdictionNorthernIreland
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
    const isValid =
      (jurisdiction === Jurisdiction.SCOTLAND && country === "Scotland") ||
      (jurisdiction === Jurisdiction.NORTHERN_IRELAND && country === "Northern Ireland") ||
      (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && (country === "England" || country === "Wales"));

    if (!isValid) {
      this.setFieldError(uiErrors, "country", this.i18n?.address?.enterAddress?.errorMessages?.jurisdictionCountry);
    }

    return isValid;
  }
}

export default AddressLookUpService;

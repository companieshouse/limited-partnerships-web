import { Address, Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../../domain/entities/UIErrors";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";

import { logger } from "../../utils";

class AddressService {
  private static readonly UK_COUNTRIES: Set<string> = new Set(["Scotland", "Northern Ireland", "England", "Wales"]);

  private static readonly VALID_UK_POSTCODE_FORMAT = /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/;
  private static readonly VALID_CHARACTERS =
    /^[-,.:; 0-9A-Z&@$£¥€'"«»?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;
  private static readonly PREMISES_MAX_LENGTH = 200;
  private static readonly MAX_LENGTH = 50;

  i18n: any;

  constructor(private readonly addressGateway: IAddressLookUpGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async isValidUKPostcodeAndHasAnAddress(
    opt: { access_token: string; refresh_token: string },
    postalCode: string,
    premises?: string,
    jurisdiction?: string
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

      if (jurisdiction && !this.isFromCorrectCountry(jurisdiction, ukAddresses, uiErrors)) {
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

  public validateAddressCharactersAndLength(address: Address, uiErrors: UIErrors | undefined): UIErrors | undefined {
    let fieldErrors = {};
    const ignoredFields = ["country"];

    for (const key in address) {
      if (ignoredFields.includes(key)) {
        continue;
      }

      let i18nFieldTitleKey = this.snakeCaseToCamelCase(key);
      if (key === "address_line_2" || key === "region" || key === "postal_code") {
        i18nFieldTitleKey += "Title";
      }

      const addressValue = address[key] ?? "";

      fieldErrors = {
        ...fieldErrors,
        ...this.checkAddressFieldForInvalidCharacters(
          key,
          addressValue,
          this.i18n?.address?.enterAddress?.[i18nFieldTitleKey]
        ),
        ...this.checkAddressFieldForCharacterLimit(
          key,
          addressValue
        )
      };
    }

    if (Object.keys(fieldErrors).length !== 0) {
      uiErrors ??= new UIErrors();
      uiErrors.formatValidationErrorToUiErrors({ errors: fieldErrors });
    }

    return uiErrors;
  }

  isValidPostcode(postalCode: string, country: string, uiErrors: UIErrors | undefined): UIErrors | undefined {
    if (AddressService.UK_COUNTRIES.has(country) && !AddressService.VALID_UK_POSTCODE_FORMAT.exec(postalCode)) {
      uiErrors ??= new UIErrors();

      this.setFieldError(uiErrors, "postal_code", this.i18n?.address?.enterAddress?.errorMessages?.postcodeFormat);
    }

    return uiErrors;
  }

  isValidJurisdictionAndCountry(
    jurisdiction: string,
    country: string,
    uiErrors: UIErrors | undefined
  ): UIErrors | undefined {
    return this.checkJurisdictionAndCountryCombinationAllowed(jurisdiction, country, uiErrors);
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

  private checkAddressFieldForCharacterLimit(
    fieldName: string,
    fieldValue: string,
  ): Record<string, string> {
    const fieldNamesWithMaxLength = {
      address_line_1: "addressLine1Length",
      address_line_2: "addressLine2Length",
      locality: "localityLength",
      region: "regionLength"
    };

    if (fieldName === "premises") {
      if (fieldValue.length > AddressService.PREMISES_MAX_LENGTH) {
        return {
          [fieldName]: " " + this.i18n?.address?.enterAddress?.errorMessages?.premisesLength
        };
      }
    } else if (fieldNamesWithMaxLength[fieldName] && fieldValue.length > AddressService.MAX_LENGTH) {
      const errorKey = fieldNamesWithMaxLength[fieldName];
      return {
        [fieldName]: " " + this.i18n?.address?.enterAddress?.errorMessages?.[errorKey]
      };
    }

    return {};
  }

  private checkAddressFieldForInvalidCharacters(
    fieldName: string,
    fieldValue: string,
    fieldTitle: string
  ): Record<string, string> {
    if (!AddressService.VALID_CHARACTERS.exec(fieldValue)) {
      return {
        [fieldName]: fieldTitle + " " + this.i18n?.address?.enterAddress?.errorMessages?.invalidCharacters
      };
    }

    return {};
  }

  private snakeCaseToCamelCase(str: string): string {
    return str.replace(/_([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());
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

  private checkJurisdictionAndCountryCombinationAllowed(
    jurisdiction: string,
    country: string,
    uiErrors: UIErrors | undefined
  ): UIErrors | undefined {
    const isValid =
      (jurisdiction === Jurisdiction.SCOTLAND && country === "Scotland") ||
      (jurisdiction === Jurisdiction.NORTHERN_IRELAND && country === "Northern Ireland") ||
      (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && (country === "England" || country === "Wales"));

    if (!isValid) {
      uiErrors ??= new UIErrors();

      this.setFieldError(uiErrors, "country", this.i18n?.address?.enterAddress?.errorMessages?.jurisdictionCountry);
    }

    return uiErrors;
  }
}

export default AddressService;

import { Address, Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import UIErrors from "../../domain/entities/UIErrors";
import IAddressLookUpGateway from "../../domain/IAddressLookUpGateway";

import { logger } from "../../utils";
import AddressValidator from "../../domain/validator/Address";

class AddressService {
  private static readonly UK_COUNTRIES: Set<string> = new Set(["Scotland", "Northern Ireland", "England", "Wales"]);
  postcodeFieldName = "postal_code";
  validCharactersRegex =
    /^[-,.:; 0-9A-Z&@$£¥€'"«»?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;

  i18n: any;

  constructor(
    private readonly addressGateway: IAddressLookUpGateway,
    private readonly addressValidator: AddressValidator
  ) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  runValidation(address: Address): UIErrors | undefined {
    return this.addressValidator.set(address, this.i18n).runValidation();
  }

  // POSTCODE VALIDATION
  public async isValidUKPostcodeAndHasAnAddress(
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

      // empty postcode
      if (!postalCode) {
        uiErrors.setWebError(
          this.postcodeFieldName,
          this.i18n?.errorMessages?.address?.postcodeLookup?.postcodeMissing
        );

        return { address, errors: uiErrors };
      }

      // invalid characters
      if (!this.validCharactersRegex.test(postalCode)) {
        uiErrors.setWebError(
          this.postcodeFieldName,
          this.i18n?.errorMessages?.address?.postcodeLookup?.postcodeInvalid
        );

        return { address, errors: uiErrors };
      }

      if (premises && !this.validCharactersRegex.test(premises)) {
        uiErrors.setWebError("premises", this.i18n?.errorMessages?.address?.postcodeLookup?.premisesInvalid);

        return { address, errors: uiErrors };
      }

      // is valid uk postcode
      const isValid = await this.addressGateway.isValidUKPostcode(opt, postalCode);

      if (!isValid) {
        uiErrors.setWebError(
          this.postcodeFieldName,
          this.i18n?.errorMessages?.address?.postcodeLookup?.postcodeNotFound
        );

        return { address, errors: uiErrors };
      }

      // has an address
      const ukAddresses: Address[] = await this.getAddressListForPostcode(opt, postalCode);

      if (ukAddresses.length === 0) {
        uiErrors.setWebError(
          this.postcodeFieldName,
          this.i18n?.errorMessages?.address?.postcodeLookup?.postcodeNotFound
        );
        return { address, errors: uiErrors };
      }

      // is from correct country and jurisdiction
      if (!this.isFromCorrectCountry(uiErrors, ukAddresses, jurisdiction)) {
        return { address, errors: uiErrors };
      }

      // if premises provided, check it matches the postcode
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

  private isFromCorrectCountry(uiErrors: UIErrors, ukAddresses: Address[], jurisdiction?: string): boolean {
    let isCorrectCountry = true;

    const country = ukAddresses[0]?.country;

    const IS_BORDER = country === "border";
    const IS_IN_ENGLAND = country === "England";
    const IS_IN_WALES = country === "Wales";
    const IS_IN_SCOTLAND = country === "Scotland";
    const IS_IN_NORTHERN_IRELAND = country === "Northern Ireland";
    const NOT_MAINLAND = ["Channel Island", "Isle of Man"];
    const IS_NOT_MAINLAND = NOT_MAINLAND.includes(country);

    if (IS_BORDER || country === "") {
      return isCorrectCountry;
    }

    if (IS_NOT_MAINLAND) {
      isCorrectCountry = false;

      uiErrors.setWebError(this.postcodeFieldName, this.i18n?.errorMessages?.address?.enterAddress?.notMainland);
    } else if (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && !IS_IN_ENGLAND && !IS_IN_WALES) {
      isCorrectCountry = false;

      uiErrors.setWebError(
        this.postcodeFieldName,
        this.i18n?.errorMessages?.address?.enterAddress?.jurisdictionEnglandAndWales
      );
    } else if (jurisdiction === Jurisdiction.SCOTLAND && !IS_IN_SCOTLAND) {
      isCorrectCountry = false;

      uiErrors.setWebError(
        this.postcodeFieldName,
        this.i18n?.errorMessages?.address?.enterAddress?.jurisdictionScotland
      );
    } else if (jurisdiction === Jurisdiction.NORTHERN_IRELAND && !IS_IN_NORTHERN_IRELAND) {
      isCorrectCountry = false;

      uiErrors.setWebError(
        this.postcodeFieldName,
        this.i18n?.errorMessages?.address?.enterAddress?.jurisdictionNorthernIreland
      );
    }

    return isCorrectCountry;
  }

  private getMatchingAddress(ukAddresses: Address[], postalCode: string, premises: string) {
    return ukAddresses.find(
      (ukAddress) =>
        ukAddress.postal_code.replace(/\s+/g, "").toLowerCase() === postalCode.replace(/\s+/g, "").toLowerCase() &&
        ukAddress.premises.toLowerCase() === premises.toLowerCase()
    );
  }

  // JURISDICTION AND COUNTRY VALIDATION
  public isValidJurisdictionAndCountry(
    jurisdiction: string,
    country: string,
    uiErrors: UIErrors | undefined
  ): UIErrors | undefined {
    if (AddressService.UK_COUNTRIES.has(country)) {
      const isValid =
        (jurisdiction === Jurisdiction.SCOTLAND && country === "Scotland") ||
        (jurisdiction === Jurisdiction.NORTHERN_IRELAND && country === "Northern Ireland") ||
        (jurisdiction === Jurisdiction.ENGLAND_AND_WALES && (country === "England" || country === "Wales"));

      if (!isValid) {
        uiErrors ??= new UIErrors();

        uiErrors.setWebError("country", this.i18n?.errorMessages?.address?.enterAddress?.jurisdictionCountry);
      }
    }

    return uiErrors;
  }

  // ADDRESS LOOKUP
  public async getAddressListForPostcode(
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

  public hasCountry(address: Address): UIErrors {
    const uiErrors = new UIErrors();

    if (!address.country) {
      uiErrors.setWebError("change", this.i18n?.errorMessages?.address?.confirm?.countryMissing);
    }

    return uiErrors;
  }
}

export default AddressService;

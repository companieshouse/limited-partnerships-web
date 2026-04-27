import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import UIErrors from "../entities/UIErrors";

class AddressValidator {
  private premises?: string;
  private address_line_1?: string;
  private address_line_2?: string;
  private region?: string;
  private locality?: string;
  private postal_code?: string;
  private country?: string;

  private errorMessages: Record<string, string> = {};

  private readonly ukCountries: Set<string> = new Set(["Scotland", "Northern Ireland", "England", "Wales"]);

  private readonly premisesFieldName = "premises";
  private readonly localityFieldName = "locality";
  private readonly postcodeFieldName = "postal_code";

  set(address: Partial<Address>, i18n: any): this {
    this.premises = address.premises;
    this.address_line_1 = address.address_line_1;
    this.address_line_2 = address.address_line_2;
    this.region = address.region;
    this.locality = address.locality;
    this.postal_code = address.postal_code;
    this.country = address.country;

    this.errorMessages = i18n?.errorMessages?.address?.enterAddress || {};

    return this;
  }

  public runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    this.isEmpty(uiErrors);
    this.isValidCharacters(uiErrors);
    this.checkAddressFieldForCharacterLimit(uiErrors);

    return uiErrors;
  }

  private isEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.premises?.trim()) {
      uiErrors.setWebError(this.premisesFieldName, this.errorMessages?.premisesMissing);
    }
    if (!this.address_line_1?.trim()) {
      uiErrors.setWebError("address_line_1", this.errorMessages?.addressLine1Missing);
    }
    if (!this.locality?.trim()) {
      uiErrors.setWebError(this.localityFieldName, this.errorMessages?.localityMissing);
    }
    const noCountryOrUkCountry = !this.country || (this.country?.trim() && this.ukCountries.has(this.country));
    if (noCountryOrUkCountry && !this.postal_code?.trim()) {
      uiErrors.setWebError(this.postcodeFieldName, this.errorMessages?.postcodeMissing);
    }
    if (!this.country?.trim()) {
      uiErrors.setWebError("country", this.errorMessages?.countryMissing);
    }

    return uiErrors;
  }

  private isValidCharacters(uiErrors: UIErrors): UIErrors {
    const validCharactersRegex =
      /^[-,.:; 0-9A-Z&@$£¥€'"«»?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;

    const conditionNotMet = (value: string) => !validCharactersRegex.test(value);
    this.fieldsValidation("Invalid", conditionNotMet, uiErrors);

    const ukPostcodeLettersNotMainland: Set<string> = new Set(["JE", "GY", "IM"]);

    if (this.country && this.ukCountries.has(this.country)) {
      this.isValidPostcode(ukPostcodeLettersNotMainland, uiErrors);
    } else if (this.postal_code && !validCharactersRegex.test(this.postal_code)) {
      uiErrors.setWebError(this.postcodeFieldName, this.errorMessages?.postcodeInvalid);
    }

    return uiErrors;
  }

  private isValidPostcode(ukPostcodeLettersNotMainland: Set<string>, uiErrors: UIErrors) {
    const validUkPostalCodeCharactersRegex = /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/;

    if (this.postal_code && ukPostcodeLettersNotMainland.has(this.postal_code.slice(0, 2))) {
      uiErrors.setWebError(this.postcodeFieldName, this.errorMessages?.notMainland);
    } else if (this.postal_code && !validUkPostalCodeCharactersRegex.test(this.postal_code)) {
      uiErrors.setWebError(this.postcodeFieldName, this.errorMessages?.postcodeFormat);
    }
  }

  private checkAddressFieldForCharacterLimit(uiErrors: UIErrors): UIErrors {
    const maxLength = 50;
    const premisesMaxLength = 200;
    const postcodeMaxLength = 20;

    if (this.postal_code && this.postal_code?.length > postcodeMaxLength) {
      uiErrors.setWebError(this.postcodeFieldName, this.errorMessages?.postalCodeLength);
    }

    const conditionNotMet = (value: string, fieldName?: string) => {
      if (fieldName === this.premisesFieldName) {
        return value.length > premisesMaxLength;
      } else {
        return value.length > maxLength;
      }
    };
    this.fieldsValidation("Length", conditionNotMet, uiErrors);

    return uiErrors;
  }

  private fieldsValidation(
    suffix: string,
    conditionNotMet: (value: string, fieldName?: string) => boolean,
    uiErrors: UIErrors
  ) {
    const fieldNames: Record<string, string> = {
      premises: this.premisesFieldName + suffix,
      address_line_1: "addressLine1" + suffix,
      address_line_2: "addressLine2" + suffix,
      region: "region" + suffix,
      locality: this.localityFieldName + suffix
    };

    for (const fieldName of Object.keys(fieldNames) as Array<keyof AddressValidator>) {
      const value = (this as any)[fieldName];

      if (typeof value === "string" && value && conditionNotMet(value, fieldName)) {
        const errorKey = fieldNames[fieldName as string];

        uiErrors.setWebError(fieldName, this.errorMessages?.[errorKey]);
      }
    }
  }
}

export default AddressValidator;

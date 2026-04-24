import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import UIErrors from "./UIErrors";

class AddressValidator {
  premises?: string;
  address_line_1?: string;
  address_line_2?: string;
  region?: string;
  locality?: string;
  postal_code?: string;
  country?: string;

  errorMessages: Record<string, string> = {};

  ukCountries: Set<string> = new Set(["Scotland", "Northern Ireland", "England", "Wales"]);

  set(address: Partial<Address>, i18n: any): AddressValidator {
    this.premises = address.premises;
    this.address_line_1 = address.address_line_1;
    this.address_line_2 = address.address_line_2;
    this.region = address.region;
    this.locality = address.locality;
    this.postal_code = address.postal_code;
    this.country = address.country;

    this.errorMessages = i18n?.errorMessages?.address;

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
    if (!this.premises) {
      uiErrors.setWebError("premises", this.errorMessages?.premisesMissing);
    }
    if (!this.address_line_1) {
      uiErrors.setWebError("address_line_1", this.errorMessages?.addressLine1Missing);
    }
    if (!this.locality) {
      uiErrors.setWebError("locality", this.errorMessages?.localityMissing);
    }
    const noCountryOrUkCountry = !this.country || (this.country && this.ukCountries.has(this.country));
    if (noCountryOrUkCountry && !this.postal_code) {
      uiErrors.setWebError("postal_code", this.errorMessages?.postcodeMissing);
    }
    if (!this.country) {
      uiErrors.setWebError("country", this.errorMessages?.countryMissing);
    }

    return uiErrors;
  }

  private isValidCharacters(uiErrors: UIErrors): UIErrors {
    const validCharactersRegex =
      /^[-,.:; 0-9A-Z&@$£¥€'"«»?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;
    const validUkPostalCodeCharactersRegex = /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/;

    const conditionNotMet = (value: string) => !validCharactersRegex.test(value);
    this.fieldsValidation("Invalid", conditionNotMet, uiErrors);

    const ukPostcodeLettersNotMailand: Set<string> = new Set(["JE", "GY", "IM"]);

    if (this.country && this.ukCountries.has(this.country)) {
      if (this.postal_code && ukPostcodeLettersNotMailand.has(this.postal_code.slice(0, 2))) {
        uiErrors.setWebError("postal_code", this.errorMessages?.notMainland);
      } else if (this.postal_code && !validUkPostalCodeCharactersRegex.test(this.postal_code)) {
        uiErrors.setWebError("postal_code", this.errorMessages?.postcodeFormat);
      }
    } else if (this.postal_code && !validCharactersRegex.test(this.postal_code)) {
      uiErrors.setWebError("postal_code", this.errorMessages?.postcodeInvalid);
    }

    return uiErrors;
  }

  private checkAddressFieldForCharacterLimit(uiErrors: UIErrors): UIErrors {
    const maxLength = 50;
    const premisesMaxLength = 200;
    const postcodeMaxLength = 20;

    if (this.postal_code && this.postal_code?.length > postcodeMaxLength) {
      uiErrors.setWebError("postal_code", this.errorMessages?.postalCodeLength);
    }

    const conditionNotMet = (value: string, fieldName?: string) => {
      if (fieldName === "premises") {
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
      premises: "premises" + suffix,
      address_line_1: "addressLine1" + suffix,
      address_line_2: "addressLine2" + suffix,
      region: "region" + suffix,
      locality: "locality" + suffix
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

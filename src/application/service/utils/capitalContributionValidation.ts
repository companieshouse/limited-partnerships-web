import UIErrors from "../../../domain/entities/UIErrors";
import { symbols } from "./currencies";

const capitalContributionValidation = (data: Record<string, string | string[]>, i18n: any): void => {
  const uiErrors = new UIErrors();

  if (!data.contribution_currency_type) {
    uiErrors.setWebError("contribution_currency_type", i18n?.errorMessages?.capitalContribution?.currencyRequired);
  }

  if (!data.contribution_sub_types?.length) {
    uiErrors.setWebError("contribution_sub_types", i18n?.errorMessages?.capitalContribution?.atLeastOneType);
  }

  contributionCurrencyValueValidation(data, uiErrors, i18n);

  if (uiErrors.hasErrors()) {
    throw uiErrors;
  }
};

const contributionCurrencyValueValidation = (data: Record<string, any>, uiErrors: UIErrors, i18n: any) => {
  const field = "contribution_currency_value";

  if (!data.contribution_currency_value) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.valueRequired);
  } else if (hasSymbol(data.contribution_currency_value, symbols)) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.noSymbols);
  } else if (hasComma(data.contribution_currency_value)) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.noComma);
  } else if (!isNumber(data.contribution_currency_value) || !has2Decimal(data.contribution_currency_value)) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.twoDecimalPlaces);
  } else if (!isGreaterThanZero(data.contribution_currency_value)) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.moreThanZero);
  }
};

const isNumber = (value: string) => {
  return !isNaN(Number(value));
};

const has2Decimal = (value: string) => {
  return value.split(".")[1]?.length === 2;
};

const isGreaterThanZero = (value: string) => {
  return parseFloat(value) > 0;
};

const hasSymbol = (str: string, symbols: string[]): boolean => {
  return symbols.some((symbol) => str.includes(symbol));
};

const hasComma = (str: string): boolean => {
  return str.includes(",");
};

export { capitalContributionValidation };

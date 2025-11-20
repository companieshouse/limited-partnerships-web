import UIErrors from "../../../domain/entities/UIErrors";
import { symbols } from "./currencies";

const capitalContributionValidation = (
  data: {
    contribution_currency_type: string;
    contribution_currency_value: string;
    contribution_sub_types: string[];
  },
  i18n: any
): void => {
  const uiErrors = new UIErrors();

  contributionCurrencyValueValidation(data, uiErrors, i18n);

  if (!data.contribution_sub_types.length) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_sub_types: i18n?.errorMessages?.capitalContribution?.atLeastOneType
      }
    });
  }

  if (!data.contribution_currency_type) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_currency_type: i18n?.errorMessages?.capitalContribution?.currencyRequired
      }
    });
  }

  if (uiErrors.hasErrors()) {
    throw uiErrors;
  }
};

const contributionCurrencyValueValidation = (
  data: { contribution_currency_type: string; contribution_currency_value: string; contribution_sub_types: string[] },
  uiErrors: UIErrors,
  i18n: any
) => {
  if (hasSymbol(data.contribution_currency_value, symbols)) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_currency_value: i18n?.errorMessages?.capitalContribution?.noSymbols
      }
    });
  } else if (hasComma(data.contribution_currency_value)) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_currency_value: i18n?.errorMessages?.capitalContribution?.noComma
      }
    });
  } else if (!isNumber(data.contribution_currency_value) || !has2Decimal(data.contribution_currency_value)) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_currency_value: i18n?.errorMessages?.capitalContribution?.twoDecimalPlaces
      }
    });
  } else if (!isGreaterThanZero(data.contribution_currency_value)) {
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        contribution_currency_value: i18n?.errorMessages?.capitalContribution?.moreThanZero
      }
    });
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

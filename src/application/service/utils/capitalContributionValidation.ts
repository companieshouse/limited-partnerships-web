import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import UIErrors from "../../../domain/entities/UIErrors";
import { symbols } from "./currencies";

// CHIPS enforces a maximum of 10 digits in total with up to 2 decimal places
// (CheckMaxDecimalValueRule precision=10, scale=2), giving a maximum value of 99999999.99.
const MAX_DIGITS = 10;

// The capital contribution section is only shown for LP/SLP partnerships in the
// registration and post-transition journeys (see capital-contribution.njk). It must
// be validated whenever that section is shown - including when every field is left
// blank - otherwise the "required" errors fall through to the backend, which returns
// them unlocalised (English). See LP-1473.
const CAPITAL_CONTRIBUTION_PARTNERSHIP_TYPES: string[] = [PartnershipType.LP, PartnershipType.SLP];

const isCapitalContributionApplicable = (data: Record<string, any>): boolean => {
  const journeyTypes = data?.journeyTypes ?? {};
  const isCapitalContributionJourney = Boolean(journeyTypes.isRegistration || journeyTypes.isPostTransition);
  const isCapitalContributionPartnershipType = CAPITAL_CONTRIBUTION_PARTNERSHIP_TYPES.includes(data?.partnershipType);

  return isCapitalContributionJourney && isCapitalContributionPartnershipType;
};

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
  } else if (!isWithinMaxDigits(data.contribution_currency_value)) {
    uiErrors.setWebError(field, i18n?.errorMessages?.capitalContribution?.maxValue);
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

// Precondition: only call once has2Decimal has confirmed exactly 2 decimal places.
// Stripping the decimal point and leading zeros then gives the count of significant
// digits, which mirrors CHIPS's BigDecimal precision (max 10 = 8 integer + 2 decimal).
const isWithinMaxDigits = (value: string) => {
  const significantDigits = value.replace(/\D/g, "").replace(/^0+/, "");
  return significantDigits.length <= MAX_DIGITS;
};

const hasSymbol = (str: string, symbols: string[]): boolean => {
  return symbols.some((symbol) => str.includes(symbol));
};

const hasComma = (str: string): boolean => {
  return str.includes(",");
};

export { capitalContributionValidation, isCapitalContributionApplicable };

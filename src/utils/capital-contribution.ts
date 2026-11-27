type CapitalContribution = {
  contribution_currency_type?: string;
  contribution_currency_value?: string;
  contribution_sub_types?: string[] | string;
};

// Extracts the ISO code from a currency label such as "Pound Sterling (GBP)".
// Values without a bracketed code (e.g. an existing code "GBP") are returned unchanged.
export const toCurrencyCode = (currency?: string): string | undefined =>
  currency?.match(/\(([A-Z]{3})\)/)?.[1] ?? currency;

const isNumeric = (text: string): boolean => text.length > 0 && [...text].every((char) => char >= "0" && char <= "9");

// Pads a contribution value to two decimal places (e.g. "1000" -> "1000.00", "1000.5" -> "1000.50").
// Values that are not simple numbers are returned unchanged.
export const formatContributionCurrencyValue = (value?: string): string => {
  if (!value) {
    return "";
  }

  const [wholeNumber, decimalPlaces, ...extraParts] = value.split(".");

  if (extraParts.length > 0 || !isNumeric(wholeNumber)) {
    return value;
  }

  if (decimalPlaces === undefined) {
    return `${value}.00`;
  }

  if (decimalPlaces.length === 1 && isNumeric(decimalPlaces)) {
    return `${value}0`;
  }

  return value;
};

const toSortedList = (subTypes?: string[] | string): string[] =>
  [subTypes ?? []].flat().sort((x, y) => x.localeCompare(y));

const haveSameSubTypes = (partnerSubTypes?: string[] | string, appointmentSubTypes?: string[] | string): boolean => {
  const sortedPartnerSubTypes = toSortedList(partnerSubTypes);
  const sortedAppointmentSubTypes = toSortedList(appointmentSubTypes);

  return (
    sortedPartnerSubTypes.length === sortedAppointmentSubTypes.length &&
    sortedPartnerSubTypes.every((value, index) => value === sortedAppointmentSubTypes[index])
  );
};

// Compares numerically so that equivalent values such as "01000.00" and "1000.00" match.
// Falls back to a text comparison when either value is missing or not a number.
const haveSameValue = (partnerValue?: string, appointmentValue?: string): boolean => {
  const partnerNumber = partnerValue?.trim() ? Number(partnerValue) : Number.NaN;
  const appointmentNumber = appointmentValue?.trim() ? Number(appointmentValue) : Number.NaN;

  if (Number.isFinite(partnerNumber) && Number.isFinite(appointmentNumber)) {
    return partnerNumber === appointmentNumber;
  }

  return partnerValue === appointmentValue;
};

export const hasCapitalContributionChanged = (
  partner?: CapitalContribution,
  appointment?: CapitalContribution
): boolean => {
  return (
    toCurrencyCode(partner?.contribution_currency_type) !== toCurrencyCode(appointment?.contribution_currency_type) ||
    !haveSameValue(partner?.contribution_currency_value, appointment?.contribution_currency_value) ||
    !haveSameSubTypes(partner?.contribution_sub_types, appointment?.contribution_sub_types)
  );
};

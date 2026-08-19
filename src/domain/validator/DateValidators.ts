import UIErrors from "../entities/UIErrors";

export enum DateErrorMessages {
  missing = "missing",
  dayMissing = "dayMissing",
  monthMissing = "monthMissing",
  yearMissing = "yearMissing",
  dayAndMonthMissing = "dayAndMonthMissing",
  dayAndYearMissing = "dayAndYearMissing",
  monthAndYearMissing = "monthAndYearMissing",
  dayInvalidLength = "dayInvalidLength",
  monthInvalidLength = "monthInvalidLength",
  yearInvalidLength = "yearInvalidLength",
  invalidChars = "invalidChars",
  invalid = "invalid",
  notInPast = "notInPast",
  beforeRegistrationDate = "beforeRegistrationDate"
}

type DateErrorKey = keyof typeof DateErrorMessages;

type DateParts = { day: string; month: string; year: string };

type DateRule = (parts: DateParts) => DateErrorKey | null;

export const validateDate = (
  body: Record<string, any>,
  uiErrors: UIErrors,
  dateFieldType: string,
  dateErrorMessages: Record<string, string>,
  registrationDate?: string,
  pageKey?: string
): void => {
  const parts = toDatePartsFromBody(body, dateFieldType);

  const errorKey = firstFailure(parts, [
    noMissingFields,
    validFieldLengths,
    digitsOnly,
    realDate,
    registrationDate ? inPastOrToday : inPast,
    ...(registrationDate ? [notBeforeRegistrationDate(registrationDate)] : [])
  ]);

  if (errorKey !== null) {
    const entry = dateErrorMessages[errorKey];
    const text = typeof entry === "object" ? entry?.[pageKey ?? ""] : entry;
    uiErrors.setWebError(dateFieldType, text);
  }
};

const toDatePartsFromBody = (body: Record<string, any>, key: string): DateParts => {
  if (body[`${key}-day`] || body[`${key}-month`] || body[`${key}-year`]) {
    return {
      day: (body[`${key}-day`] ?? "").trim(),
      month: (body[`${key}-month`] ?? "").trim(),
      year: (body[`${key}-year`] ?? "").trim()
    };
  }
  return body as DateParts;
};

const parseDateParts = ({ day, month, year }: DateParts): { d: number; m: number; y: number } | null => {
  if (!day || !month || !year) {
    return null;
  }

  if (!isDigitsOnly(day) || !isDigitsOnly(month) || !isDigitsOnly(year)) {
    return null;
  }

  // months are 0-indexed in JavaScript Date, so we need to subtract 1 from the month
  return { d: Number(day), m: Number(month) - 1, y: Number(year) };
};

const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

const utcMidnightFromDateParts = (parts: DateParts): number | null => {
  const parsed = parseDateParts(parts);

  return parsed === null ? null : Date.UTC(parsed.y, parsed.m, parsed.d);
};

const utcMidnightFromIsoDate = (isoDate: string): number | null => {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
};

/**
 * Compares the date with today, both at UTC midnight to avoid daylight saving and timezone drift.
 * Negative when in the past, zero for today, positive when in the future, null when unparseable.
 */
const compareWithToday = (parts: DateParts): number | null => {
  const targetUtcMidnight = utcMidnightFromDateParts(parts);

  if (targetUtcMidnight === null) {
    return null;
  }

  const now = new Date();

  return targetUtcMidnight - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
};

const isRealCalendarDate = (parts: DateParts): boolean => {
  const parsed = parseDateParts(parts);

  if (parsed === null) {
    return false;
  }

  const { d, m, y } = parsed;

  // Check if the date is valid by creating a new Date object and comparing the components
  const date = new Date(Date.UTC(y, m, d));

  return date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d;
};

const containsNonDigits = ({ day, month, year }: DateParts): boolean =>
  [day, month, year].some((value) => value !== "" && !isDigitsOnly(value));

// keys represent which fields are present: d=day, m=month, y=year, -=missing
const MISSING_FIELDS_ERROR_KEY: Record<string, DateErrorKey> = {
  "---": DateErrorMessages.missing,
  "-my": DateErrorMessages.dayMissing,
  "d-y": DateErrorMessages.monthMissing,
  "dm-": DateErrorMessages.yearMissing,
  "--y": DateErrorMessages.dayAndMonthMissing,
  "d--": DateErrorMessages.monthAndYearMissing,
  "-m-": DateErrorMessages.dayAndYearMissing
};

const noMissingFields: DateRule = ({ day, month, year }) => {
  const presence = `${day ? "d" : "-"}${month ? "m" : "-"}${year ? "y" : "-"}`;

  return MISSING_FIELDS_ERROR_KEY[presence] ?? null;
};

const validFieldLengths: DateRule = ({ day, month, year }) => {
  if (day.length > 2) {
    return DateErrorMessages.dayInvalidLength;
  }

  if (month.length > 2) {
    return DateErrorMessages.monthInvalidLength;
  }

  if (year.length !== 4) {
    return DateErrorMessages.yearInvalidLength;
  }

  return null;
};

const digitsOnly: DateRule = (parts) => (containsNonDigits(parts) ? DateErrorMessages.invalidChars : null);

const realDate: DateRule = (parts) => (isRealCalendarDate(parts) ? null : DateErrorMessages.invalid);

const inPast: DateRule = (parts) => {
  const comparison = compareWithToday(parts);

  return comparison !== null && comparison < 0 ? null : DateErrorMessages.notInPast;
};

const inPastOrToday: DateRule = (parts) => {
  const comparison = compareWithToday(parts);

  return comparison !== null && comparison <= 0 ? null : DateErrorMessages.notInPast;
};

const notBeforeRegistrationDate =
  (registrationDate: string): DateRule =>
    (parts) => {
      const registration = utcMidnightFromIsoDate(registrationDate);
      const entered = utcMidnightFromDateParts(parts);

      if (registration === null || entered === null) {
        return null;
      }

      return entered < registration ? DateErrorMessages.beforeRegistrationDate : null;
    };

const firstFailure = (dateParts: DateParts, dateRules: DateRule[]): DateErrorKey | null => {
  for (const rule of dateRules) {
    const errorKey = rule(dateParts);

    if (errorKey !== null) {
      return errorKey;
    }
  }

  return null;
};

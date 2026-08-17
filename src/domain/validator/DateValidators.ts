import { DATE_OF_BIRTH_FIELD, DATE_OF_UPDATE_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";

export type DateErrorMessages = {
  missing: string;
  dayMissing: string;
  monthMissing: string;
  yearMissing: string;
  dayAndMonthMissing: string;
  dayAndYearMissing: string;
  monthAndYearMissing: string;
  dayInvalidLength: string;
  monthInvalidLength: string;
  yearInvalidLength: string;
  invalidChars: string;
  invalid: string;
  notInPast: string;
  beforeRegistrationDate?: string;
};

export type DateErrorKey = keyof DateErrorMessages;

// This type is required because the date error messages for a page may be scoped to a specific page, e.g. "dateOfUpdate" errors are scoped to the page title key.
// Whereas date of birth errors are not scoped to a specific page, and are always the same regardless of the page.
export type PageScopedDateErrorMessages = Partial<Record<DateErrorKey, string | Record<string, string>>>;

type DateParts = { day: string; month: string; year: string };

type DateRule = (parts: DateParts) => DateErrorKey | null;

const toDateParts = (day?: string, month?: string, year?: string): DateParts => ({
  day: (day ?? "").trim(),
  month: (month ?? "").trim(),
  year: (year ?? "").trim()
});

const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

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
};;

const containsNonDigits = ({ day, month, year }: DateParts): boolean =>
  [day, month, year].some((value) => value !== "" && !isDigitsOnly(value));

// keys represent which fields are present: d=day, m=month, y=year, -=missing
const MISSING_FIELDS_ERROR_KEY: Record<string, DateErrorKey> = {
  "---": "missing",
  "-my": "dayMissing",
  "d-y": "monthMissing",
  "dm-": "yearMissing",
  "--y": "dayAndMonthMissing",
  "d--": "monthAndYearMissing",
  "-m-": "dayAndYearMissing"
};

const noMissingFields: DateRule = ({ day, month, year }) => {
  const presence = `${day ? "d" : "-"}${month ? "m" : "-"}${year ? "y" : "-"}`;

  return MISSING_FIELDS_ERROR_KEY[presence] ?? null;
};

const validFieldLengths: DateRule = ({ day, month, year }) => {
  if (day.length > 2) {
    return "dayInvalidLength";
  }

  if (month.length > 2) {
    return "monthInvalidLength";
  }

  if (year.length !== 4) {
    return "yearInvalidLength";
  }

  return null;
};

const digitsOnly: DateRule = (parts) => (containsNonDigits(parts) ? "invalidChars" : null);

const realDate: DateRule = (parts) => (isRealCalendarDate(parts) ? null : "invalid");

const inPast: DateRule = (parts) => {
  const comparison = compareWithToday(parts);

  return comparison !== null && comparison < 0 ? null : "notInPast";
};

const inPastOrToday: DateRule = (parts) => {
  const comparison = compareWithToday(parts);

  return comparison !== null && comparison <= 0 ? null : "notInPast";
};

const notBeforeRegistrationDate =
  (registrationDate: string): DateRule =>
    (parts) => {
      const registration = utcMidnightFromIsoDate(registrationDate);
      const entered = utcMidnightFromDateParts(parts);

      if (registration === null || entered === null) {
        return null;
      }

      return entered < registration ? "beforeRegistrationDate" : null;
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

export const validateDateOfBirth = (
  day: string | undefined,
  month: string | undefined,
  year: string | undefined,
  uiErrors: UIErrors,
  dateErrorMessages: DateErrorMessages
): void => {
  const parts = toDateParts(day, month, year);

  const errorKey = firstFailure(parts, [noMissingFields, validFieldLengths, digitsOnly, realDate, inPast]);

  if (errorKey !== null) {
    // safe cast: DOB rules never produce "beforeRegistrationDate", which is the only optional key
    uiErrors.setWebError(DATE_OF_BIRTH_FIELD, dateErrorMessages[errorKey] as string);
  }
};

export const validateDateOfUpdate = (
  day: string | undefined,
  month: string | undefined,
  year: string | undefined,
  dateErrorMessages: PageScopedDateErrorMessages,
  pageKey: string,
  registrationDate: string
): UIErrors => {
  const uiErrors = new UIErrors();
  const parts = toDateParts(day, month, year);

  const errorKey = firstFailure(parts, [
    noMissingFields,
    digitsOnly,
    validFieldLengths,
    realDate,
    inPastOrToday,
    notBeforeRegistrationDate(registrationDate)
  ]);

  if (errorKey !== null) {
    const entry = dateErrorMessages[errorKey];
    const text = typeof entry === "string" ? entry : (entry?.[pageKey] ?? "");
    uiErrors.setWebError(DATE_OF_UPDATE_FIELD, text);
  }

  return uiErrors;
};

export const isValidDate = (day: string, month: string, year: string): boolean =>
  isRealCalendarDate(toDateParts(day, month, year));

export const dateContainsInvalidChars = (day: string, month: string, year: string): boolean =>
  containsNonDigits(toDateParts(day, month, year));

export const isDateInPast = (day: string, month: string, year: string): boolean => inPast(toDateParts(day, month, year)) === null;

export const isDateInPastOrToday = (day: string, month: string, year: string): boolean =>
  inPastOrToday(toDateParts(day, month, year)) === null;

export const isDateToday = (day: string, month: string, year: string): boolean =>
  compareWithToday(toDateParts(day, month, year)) === 0;

export const isBeforeRegistrationDate = (day: string, month: string, year: string, registrationDate: string): boolean =>
  notBeforeRegistrationDate(registrationDate)(toDateParts(day, month, year)) !== null;

export const isValidDateStringAndNotInFuture = (date: string): boolean => {
  const [year, month, day, ...unexpected] = date.split("-");

  if (unexpected.length > 0) {
    return false;
  }

  const parts = toDateParts(day, month, year);

  return validFieldLengths(parts) === null && isRealCalendarDate(parts) && inPastOrToday(parts) === null;
};

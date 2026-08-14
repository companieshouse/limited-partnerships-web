import { DATE_OF_BIRTH_FIELD } from "../../config";
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
};

export const validateDateOfBirth = (day: string | undefined, month: string | undefined, year: string | undefined, uiErrors: UIErrors, dateErrorMessages: DateErrorMessages) => {
  const safeDobDay = day ?? "";
  const safeDobMonth = month ?? "";
  const safeDobYear = year ?? "";
  const dateOfBirthField = DATE_OF_BIRTH_FIELD;

  if (hasMissingDateFields(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages)) {
    return;
  }

  if (hasInvalidDateFieldLengths(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages)) {
    return;
  }

  if (dateContainsInvalidChars(safeDobDay, safeDobMonth, safeDobYear)) {
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.invalidChars);
    return;
  }

  if (!isValidDate(safeDobDay, safeDobMonth, safeDobYear)) {
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.invalid);
    return;
  }

  if (!isDateInPast(safeDobDay, safeDobMonth, safeDobYear)) {
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.notInPast);
  }
};

export const validateDateOfUpdate = (
  day: string,
  month: string,
  year: string,
  dateErrorMessages: Record<string, any>,
  pageKey: string,
  registrationDate: string
): UIErrors => {
  const safeDay = day ?? "";
  const safeMonth = month ?? "";
  const safeYear = year ?? "";
  const dateOfUpdateField = "date_of_update";

  const uiErrors: UIErrors = new UIErrors();

  if (hasMissingDateFields(safeDay, safeMonth, safeYear, dateOfUpdateField, uiErrors, dateErrorMessages, pageKey)) {
    return uiErrors;
  }

  if (dateContainsInvalidChars(safeDay, safeMonth, safeYear)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.invalidChars[pageKey]);
    return uiErrors;
  }

  if (hasInvalidDateFieldLengths(safeDay, safeMonth, safeYear, dateOfUpdateField, uiErrors, dateErrorMessages)) {
    return uiErrors;
  }

  if (!isValidDate(safeDay, safeMonth, safeYear)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.invalid[pageKey]);
    return uiErrors;
  }

  if (!isDateInPastOrToday(safeDay, safeMonth, safeYear)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.notInPast[pageKey]);
    return uiErrors;
  }

  if (isBeforeRegistrationDate(safeDay, safeMonth, safeYear, registrationDate)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.beforeRegistrationDate[pageKey]);
  }

  return uiErrors;
};

const getUtcMidnightFromIsoDate = (isoDate: string): number | null => {
  const parsedRegistrationDate = new Date(isoDate);

  if (Number.isNaN(parsedRegistrationDate.getTime())) {
    return null;
  }

  return Date.UTC(
    parsedRegistrationDate.getUTCFullYear(),
    parsedRegistrationDate.getUTCMonth(),
    parsedRegistrationDate.getUTCDate()
  );
};

const getUtcMidnightFromDateParts = (day: string, month: string, year: string): number | null => {
  const parsedDateParts = parseDateParts(day, month, year);

  if (!parsedDateParts) {
    return null;
  }

  return Date.UTC(parsedDateParts.y, parsedDateParts.m, parsedDateParts.d);
};

const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

const parseDateParts = (day: string, month: string, year: string): { d: number; m: number; y: number } | null => {
  const trimmedDay = (day || "").trim();
  const trimmedMonth = (month || "").trim();
  const trimmedYear = (year || "").trim();

  if (!trimmedDay || !trimmedMonth || !trimmedYear) {
    return null;
  }

  if (!isDigitsOnly(trimmedDay) || !isDigitsOnly(trimmedMonth) || !isDigitsOnly(trimmedYear)) {
    return null;
  }

  // months are 0-indexed in JavaScript Date, so we need to subtract 1 from the month
  const y = Number(trimmedYear);
  const m = Number(trimmedMonth) - 1;
  const d = Number(trimmedDay);

  if ([y, m, d].some(Number.isNaN)) {
    return null;
  }

  return { d, m, y };
};

// keys represent which fields are present: d=day, m=month, y=year, -=missing
const MISSING_FIELDS_ERROR_KEY: Record<string, keyof DateErrorMessages> = {
  "---": "missing",
  "-my": "dayMissing",
  "d-y": "monthMissing",
  "dm-": "yearMissing",
  "--y": "dayAndMonthMissing",
  "d--": "monthAndYearMissing",
  "-m-": "dayAndYearMissing"
};

const hasMissingDateFields = (
  day: string,
  month: string,
  year: string,
  fieldId: string,
  uiErrors: UIErrors,
  errorMessages: DateErrorMessages | Record<string, any>,
  pageKey?: string
): boolean => {
  const key = `${day?.trim() ? "d" : "-"}${month?.trim() ? "m" : "-"}${year?.trim() ? "y" : "-"}`;
  const errorKey = MISSING_FIELDS_ERROR_KEY[key];

  if (!errorKey) {
    return false;
  }

  const message = errorMessages?.[errorKey];
  uiErrors.setWebError(fieldId, pageKey ? message[pageKey] : message);
  return true;
};

const hasInvalidDateFieldLengths = (
  day: string,
  month: string,
  year: string,
  fieldId: string,
  uiErrors: UIErrors,
  errorMessages: DateErrorMessages | Record<string, any>
): boolean => {
  if ((day?.trim().length || 0) > 2) {
    uiErrors.setWebError(fieldId, errorMessages?.dayInvalidLength);
    return true;
  }

  if ((month?.trim().length || 0) > 2) {
    uiErrors.setWebError(fieldId, errorMessages?.monthInvalidLength);
    return true;
  }

  if ((year?.trim().length || 0) !== 4) {
    uiErrors.setWebError(fieldId, errorMessages?.yearInvalidLength);
    return true;
  }
  return false;
};

export const isValidDate = (day: string, month: string, year: string): boolean => {
  const parsedDateParts = parseDateParts(day, month, year);

  if (!parsedDateParts) {
    return false;
  }

  const { d, m, y } = parsedDateParts;

  // handles leap years as well
  const parsedDate = new Date(y, m, d);

  return (
    parsedDate.getFullYear() === y &&
    parsedDate.getMonth() === m &&
    parsedDate.getDate() === d
  );
};

export const isValidDateStringAndNotInFuture = (date: string): boolean => {
  const [year, month, day] = date.split("-");
  const isDayInvalid = day.length > 2;
  const isMonthInvalid = month.length > 2;
  const isYearInvalid = year.length !== 4;

  if (isDayInvalid || isMonthInvalid || isYearInvalid) {
    return false;
  }

  if (!isValidDate(day, month, year)) {
    return false;
  }
  if (!isDateInPast(day, month, year) && !isDateToday(day, month, year)) {
    return false;
  }
  return true;
};

export const isDateInPastOrToday = (day: string, month: string, year: string): boolean => {
  const targetUtcMidnight = getUtcMidnightFromDateParts(day, month, year);

  if (targetUtcMidnight === null) {
    return false;
  }

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight <= todayUtcMidnightForLocal;
};

export const isDateInPast = (day: string, month: string, year: string): boolean => {
  const targetUtcMidnight = getUtcMidnightFromDateParts(day, month, year);

  if (targetUtcMidnight === null) {
    return false;
  }

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight < todayUtcMidnightForLocal;
};

export const isDateToday = (day: string, month: string, year: string): boolean => {
  const targetUtcMidnight = getUtcMidnightFromDateParts(day, month, year);

  if (targetUtcMidnight === null) {
    return false;
  }

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight === todayUtcMidnightForLocal;
};

export const isBeforeRegistrationDate = (day: string, month: string, year: string, registrationDate: string): boolean => {
  const registrationDateUtcMidnight = getUtcMidnightFromIsoDate(registrationDate);
  const enteredDateUtcMidnight = getUtcMidnightFromDateParts(day, month, year);

  if (enteredDateUtcMidnight === null || registrationDateUtcMidnight === null) {
    return false;
  }

  return enteredDateUtcMidnight < registrationDateUtcMidnight;
};

export const dateContainsInvalidChars = (day: string, month: string, year: string): boolean => {
  const trimmedDay = (day || "").trim();
  const trimmedMonth = (month || "").trim();
  const trimmedYear = (year || "").trim();

  if ((trimmedDay && !isDigitsOnly(trimmedDay)) ||
      (trimmedMonth && !isDigitsOnly(trimmedMonth)) ||
      (trimmedYear && !isDigitsOnly(trimmedYear))) {
    return true;
  }

  return false;
};

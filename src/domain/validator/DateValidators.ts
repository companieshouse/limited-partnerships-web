import { DATE_OF_BIRTH_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";

export type DateErrorMessages = {
  dateMissing: string;
  dayMissing: string;
  monthMissing: string;
  yearMissing: string;
  dayAndMonthMissing: string;
  dayAndYearMissing: string;
  monthAndYearMissing: string;
  dayInvalidLength: string;
  monthInvalidLength: string;
  yearInvalidLength: string;
  dateInvalidChars: string;
  dateInvalidDate: string;
  dateNotInPast: string;
}

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
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.dateInvalidChars);
    return;
  }

  if (!isValidDate(safeDobDay, safeDobMonth, safeDobYear)) {
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.dateInvalidDate);
    return;
  }

  if (!isDateInPast(safeDobDay, safeDobMonth, safeDobYear)) {
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.dateNotInPast);
  }
};

export const validateDateOfUpdate = (
  day: string,
  month: string,
  year: string,
  dateErrorMessages: Record<string, any>,
  pageKey: string,
  registrationDate?: string
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
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.dateInvalidChars[pageKey]);
    return uiErrors;
  }

  if (hasInvalidDateFieldLengths(safeDay, safeMonth, safeYear, dateOfUpdateField, uiErrors, dateErrorMessages)) {
    return uiErrors;
  }

  if (!isValidDate(safeDay, safeMonth, safeYear)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.dateInvalidDate[pageKey]);
    return uiErrors;
  }

  if (!isDateInPastOrToday(safeDay, safeMonth, safeYear)) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.dateNotInPast[pageKey]);
    return uiErrors;
  }

  const registrationDateUtcMidnight = registrationDate ? getUtcMidnightFromIsoDate(registrationDate) : null;
  const enteredDateUtcMidnight = getUtcMidnightFromDateParts(safeDay, safeMonth, safeYear);
  const isEnteredDateBeforeRegistrationDate =
    enteredDateUtcMidnight !== null &&
    registrationDateUtcMidnight !== null &&
    enteredDateUtcMidnight < registrationDateUtcMidnight;

  if (isEnteredDateBeforeRegistrationDate) {
    uiErrors.setWebError(dateOfUpdateField, dateErrorMessages?.dateBeforeRegistrationDate[pageKey]);
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

const hasMissingDateFields = (
  day: string,
  month: string,
  year: string,
  fieldId: string,
  uiErrors: UIErrors,
  errorMessages: DateErrorMessages | Record<string, any>,
  pageKey?: string
): boolean => {
  if (!day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.dateMissing[pageKey] : errorMessages?.dateMissing);
    return true;
  }

  if (!day?.trim() && month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.dayMissing[pageKey] : errorMessages?.dayMissing);
    return true;
  }

  if (day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.monthMissing[pageKey] : errorMessages?.monthMissing);
    return true;
  }

  if (day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.yearMissing[pageKey] : errorMessages?.yearMissing);
    return true;
  }

  if (!day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.dayAndMonthMissing[pageKey] : errorMessages?.dayAndMonthMissing);
    return true;
  }

  if (day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.monthAndYearMissing[pageKey] : errorMessages?.monthAndYearMissing);
    return true;
  }

  if (!day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, pageKey ? errorMessages?.dayAndYearMissing[pageKey] : errorMessages?.dayAndYearMissing);
    return true;
  }

  return false;
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

const isDateInPastOrToday = (day: string, month: string, year: string): boolean => {
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

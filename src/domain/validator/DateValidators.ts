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
  dateOfBirthNotInPast: string;
}

export const getDateErrorMessages = (i18n: any): DateErrorMessages => {
  return {
    dateMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthMissing,
    dayMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthDayMissing,
    monthMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthMonthMissing,
    yearMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthYearMissing,
    dayAndMonthMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthDayAndMonthMissing,
    dayAndYearMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthDayAndYearMissing,
    monthAndYearMissing: i18n?.errorMessages?.dateOfBirth?.dateOfBirthMonthAndYearMissing,
    dayInvalidLength: i18n?.errorMessages?.dateOfBirth?.dateOfBirthDayInvalidLength,
    monthInvalidLength: i18n?.errorMessages?.dateOfBirth?.dateOfBirthMonthInvalidLength,
    yearInvalidLength: i18n?.errorMessages?.dateOfBirth?.dateOfBirthYearInvalidLength,
    dateInvalidChars: i18n?.errorMessages?.dateOfBirth?.dateOfBirthInvalidChars,
    dateInvalidDate: i18n?.errorMessages?.dateOfBirth?.dateOfBirthInvalidDate,
    dateOfBirthNotInPast: i18n?.errorMessages?.dateOfBirth?.dateOfBirthNotInPast
  };
};

export const validateDateOfBirth = (day: string | undefined, month: string | undefined, year: string | undefined, uiErrors: UIErrors, dateErrorMessages: DateErrorMessages) => {
  const safeDobDay = day ?? "";
  const safeDobMonth = month ?? "";
  const safeDobYear = year ?? "";
  const dateOfBirthField = DATE_OF_BIRTH_FIELD;

  if (hasMissingDateFields(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages)) {
    return;
  };

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
    uiErrors.setWebError(dateOfBirthField, dateErrorMessages?.dateOfBirthNotInPast);
  }
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

export const hasMissingDateFields = (day: string, month: string, year: string, fieldId: string, uiErrors: UIErrors, errorMessages: DateErrorMessages): boolean => {
  if (!day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dateMissing);
    return true;
  }

  if (!day?.trim() && month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayMissing);
    return true;
  }

  if (day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.monthMissing);
    return true;
  }

  if (day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.yearMissing);
    return true;
  }

  if (!day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayAndMonthMissing);
    return true;
  }

  if (day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.monthAndYearMissing);
    return true;
  }

  if (!day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayAndYearMissing);
    return true;
  }

  return false;
};

export const hasInvalidDateFieldLengths = (day: string, month: string, year: string, fieldId: string, uiErrors: UIErrors, errorMessages: DateErrorMessages): boolean => {
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

export const isDateInPast = (day: string, month: string, year: string): boolean => {
  const parsedDateParts = parseDateParts(day, month, year);

  if (!parsedDateParts) {
    return false;
  }

  const { d, m, y } = parsedDateParts;

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const targetUtcMidnight = Date.UTC(y, m, d);
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight < todayUtcMidnightForLocal;
};

export const isDateToday = (day: string, month: string, year: string): boolean => {
  const parsedDateParts = parseDateParts(day, month, year);

  if (!parsedDateParts) {
    return false;
  }

  const { d, m, y } = parsedDateParts;

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const targetUtcMidnight = Date.UTC(y, m, d);
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

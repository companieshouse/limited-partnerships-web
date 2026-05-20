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
}

const parseDateParts = (day: string, month: string, year: string): { y: number; m: number; d: number } | null => {
  // months are 0-indexed in JavaScript Date, so we need to subtract 1 from the month
  const y = Number(year);
  const m = Number(month) - 1;
  const d = Number(day);

  if ([y, m, d].some(Number.isNaN)) {
    return null;
  }

  return { y, m, d };
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

  const { y, m, d } = parsedDateParts;

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

  const { y, m, d } = parsedDateParts;

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

  const { y, m, d } = parsedDateParts;

  // use UTC to deal with daylight savings and timezones; compare date-only at UTC midnight
  const targetUtcMidnight = Date.UTC(y, m, d);
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight === todayUtcMidnightForLocal;
};

export const dateContainsInvalidChars = (day: string, month: string, year: string): boolean => {
  const parsedDay = parseInt(day || "0", 10);
  const parsedMonth = parseInt(month || "0", 10);
  const parsedYear = parseInt(year || "0", 10);

  if (isNaN(parsedDay) || isNaN(parsedMonth) || isNaN(parsedYear)) {
    return true;
  }

  return false;
};

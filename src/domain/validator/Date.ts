// TODO move this imported function?
import { convertDateToIsoDateString } from "../../infrastructure/gateway/utils";
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

export const validateMisingDateFields = (day: string, month: string, year: string, fieldId: string, uiErrors: UIErrors, errorMessages: DateErrorMessages) => {
  if (!day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dateMissing);
  }

  if (!day?.trim() && month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayMissing);
  }

  if (day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.monthMissing);
  }

  if (day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.yearMissing);
  }

  if (!day?.trim() && !month?.trim() && year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayAndMonthMissing);
  }

  if (day?.trim() && !month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.monthAndYearMissing);
  }

  if (!day?.trim() && month?.trim() && !year?.trim()) {
    uiErrors.setWebError(fieldId, errorMessages?.dayAndYearMissing);
  }
};

export const validateDateFieldLengths = (day: string, month: string, year: string, fieldId: string, uiErrors: UIErrors, errorMessages: DateErrorMessages) => {
  if ((day?.trim().length || 0) > 2) {
    uiErrors.setWebError(fieldId, errorMessages?.dayInvalidLength);
  }

  if ((month?.trim().length || 0) > 2) {
    uiErrors.setWebError(fieldId, errorMessages?.monthInvalidLength);
  }

  if ((year?.trim().length || 0) !== 4) {
    uiErrors.setWebError(fieldId, errorMessages?.yearInvalidLength);
  }
};

export const isValidDate = (day: string, month: string, year: string): boolean => {
  // only validate if we have all 3 components of the date, otherwise we will have false negatives when day or month is missing
  if (!day?.trim() || !month?.trim() || !year?.trim()) {
    return true;
  }

  const dateStr = convertDateToIsoDateString(day, month, year);

  const [yearNum, monthNum, dayNum] = dateStr.split('-').map(Number);
  // months are 0-indexed in JavaScript Date, so we need to subtract 1 from the month
  const parsedDate = new Date(yearNum, monthNum - 1, dayNum);

  return (
    parsedDate.getFullYear() === yearNum &&
    parsedDate.getMonth() === monthNum - 1 &&
    parsedDate.getDate() === dayNum
  );
};

export const isDateInFuture = (day: string, month: string, year: string): boolean => {
  // only validate if we have all 3 components of the date, otherwise we will have false negatives when day or month is missing
  if (!day?.trim() || !month?.trim() || !year?.trim()) {
    return false;
  }

  const y = Number(year);
  const m = Number(month) - 1;
  const d = Number(day);
  if ([y, m, d].some(Number.isNaN)) {
    return false;
  }

  const targetUtcMidnight = Date.UTC(y, m, d);
  const now = new Date();
  const todayUtcMidnightForLocal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return targetUtcMidnight > todayUtcMidnightForLocal;
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

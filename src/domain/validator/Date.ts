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
  const dateStr = convertDateToIsoDateString(day, month, year);

  const [paddedYear, paddedMonth, paddedDay] = dateStr.split('-').map(Number);
  // months are 0-indexed in JavaScript Date, so we need to subtract 1 from the month
  const parsedDate = new Date(paddedYear, paddedMonth - 1, paddedDay);

  // only validate if we have all 3 components of the date, otherwise we will have false negatives when day or month is missing
  if (!day?.trim() || !month?.trim() || !year?.trim()) {
    return true;
  }

  return (
    parsedDate.getFullYear() === paddedYear &&
    parsedDate.getMonth() === paddedMonth - 1 &&
    parsedDate.getDate() === paddedDay
  );
};

export const isDateInFuture = (day: string, month: string, year: string): boolean => {
  const isoDateString = convertDateToIsoDateString(day, month, year);
  const targetTimestamp = Date.parse(isoDateString);

  // Return false early if the string is invalid
  if (Number.isNaN(targetTimestamp)) {
    return false;
  }

  // Compare directly against the exact current millisecond
  return targetTimestamp > Date.now();
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

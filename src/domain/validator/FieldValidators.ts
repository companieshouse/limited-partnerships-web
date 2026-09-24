import UIErrors from "../entities/UIErrors";
import { VALID_CHARACTERS_REGEX } from "../../config/constants";

export const containsInvalidCharacters = (fieldValue: string = "", fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean => {
  if (fieldValue && !VALID_CHARACTERS_REGEX.test(fieldValue)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueMissing = (fieldValue: string = "", fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean => {
  if (typeof fieldValue === "string" ? !fieldValue?.trim() : (fieldValue === undefined || fieldValue === null)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueTooLong = (fieldValue: string = "", maxLength: number, fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean => {
  if (fieldValue?.trim().length && fieldValue?.trim().length > maxLength) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const validateField = (fieldValue: string = "", fieldName: string, maxLength: number, uiErrors: UIErrors, errorMessages: Record<string, string>) => {
  const { missingMessage, invalidMessage, tooLongMessage } = errorMessages;

  if (isFieldValueMissing(fieldValue, fieldName, uiErrors, missingMessage)) {
    return;
  }

  if (containsInvalidCharacters(fieldValue, fieldName, uiErrors, invalidMessage)) {
    return;
  }

  if (isFieldValueTooLong(fieldValue, maxLength, fieldName, uiErrors, tooLongMessage)) {
    return;
  }
};

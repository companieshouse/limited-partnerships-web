import UIErrors from "../entities/UIErrors";
import { VALID_CHARACTERS_REGEX } from "../../config/constants";

export const containsInvalidCharacters = (fieldName: string, uiErrors: UIErrors, errorMessage: string, fieldValue: string = ""): boolean => {
  if (fieldValue && !VALID_CHARACTERS_REGEX.test(fieldValue)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueMissing = (fieldName: string, uiErrors: UIErrors, errorMessage: string, fieldValue: string = ""): boolean => {
  if (typeof fieldValue === "string" ? !fieldValue?.trim() : (fieldValue === undefined || fieldValue === null)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueTooLong = (maxLength: number, fieldName: string, uiErrors: UIErrors, errorMessage: string, fieldValue: string = "",): boolean => {
  if (fieldValue?.trim().length && fieldValue?.trim().length > maxLength) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const validateField = (fieldName: string, maxLength: number, uiErrors: UIErrors, errorMessages: Record<string, string>, fieldValue: string = "") => {
  const { missingMessage, invalidMessage, tooLongMessage } = errorMessages;

  if (isFieldValueMissing(fieldName, uiErrors, missingMessage, fieldValue)) {
    return;
  }

  if (containsInvalidCharacters(fieldName, uiErrors, invalidMessage, fieldValue)) {
    return;
  }

  if (isFieldValueTooLong(maxLength, fieldName, uiErrors, tooLongMessage, fieldValue)) {
    return;
  }
};

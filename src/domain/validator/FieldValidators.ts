import UIErrors from "../entities/UIErrors";
import { VALID_CHARACTERS_REGEX } from "../../config/constants";

export const containsInvalidCharacters = (uiErrors: UIErrors, errorMessage: string, fieldName: string, fieldValue: string = ""): boolean => {
  if (fieldValue && !VALID_CHARACTERS_REGEX.test(fieldValue)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueMissing = (uiErrors: UIErrors, errorMessage: string, fieldName: string, fieldValue: string = ""): boolean => {
  if (!fieldValue.trim()) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const isFieldValueTooLong = (maxLength: number, uiErrors: UIErrors, errorMessage: string, fieldName: string, fieldValue: string = ""): boolean => {
  if (fieldValue?.trim().length && fieldValue?.trim().length > maxLength) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export const validateField = (maxLength: number, uiErrors: UIErrors, errorMessages: Record<string, string>, fieldName: string, fieldValue: string = "") => {
  const { missingMessage, invalidMessage, tooLongMessage } = errorMessages;

  if (isFieldValueMissing(uiErrors, missingMessage, fieldName, fieldValue)) {
    return;
  }

  if (containsInvalidCharacters(uiErrors, invalidMessage, fieldName, fieldValue)) {
    return;
  }

  if (isFieldValueTooLong(maxLength, uiErrors, tooLongMessage, fieldName, fieldValue)) {
    return;
  }
};

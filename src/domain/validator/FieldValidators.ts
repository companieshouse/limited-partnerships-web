import UIErrors from "../entities/UIErrors";
import { VALID_CHARACTERS_REGEX } from "../../config/constants";

export function containsInvalidCharacters(fieldValue: string | undefined, fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean {
  if (fieldValue && !VALID_CHARACTERS_REGEX.test(fieldValue)) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

export function isFieldValueMissing(fieldValue: string | undefined, fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean {
  if (!fieldValue?.trim()) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
}

export function isFieldValueTooLong(fieldValue: string | undefined, maxLength: number, fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean {
  if (fieldValue?.trim().length && fieldValue?.trim().length > maxLength) {
    uiErrors.setWebError(fieldName, errorMessage);
    return true;
  }
  return false;
};

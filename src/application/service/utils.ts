import UIErrors from "../../domain/entities/UIErrors";

export const extractAPIErrors = (errors: any) => {
  const isValidationErrors = errors instanceof UIErrors;
  const apiErrors = isValidationErrors ? errors?.apiErrors : errors;

  return { apiErrors, isValidationErrors };
};

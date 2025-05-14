import UIErrors from "../../domain/entities/UIErrors";
import { TRANSACTION_ID, SUBMISSION_ID } from "../../config/constants";

export const extractAPIErrors = (errors: any) => {
  const isValidationErrors = errors instanceof UIErrors;
  const apiErrors = isValidationErrors ? errors?.apiErrors : errors;

  return { apiErrors, isValidationErrors };
};

export const getUrlWithTransactionIdAndSubmissionId = (url: string, transactionId: string, submissionId: string): string => {
  url = url
    .replace(`:${TRANSACTION_ID}`, transactionId)
    .replace(`:${SUBMISSION_ID}`, submissionId);
  return url;
};

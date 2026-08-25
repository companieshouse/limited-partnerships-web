import UIErrors from "../../domain/entities/UIErrors";

export const convertValidDateToIsoDateString = (data: { day: string; month: string; year: string }): string => {
  const { day, month, year } = data;
  return `${year.trim()}-${zeroPadNumber(month.trim())}-${zeroPadNumber(day.trim())}`;
};

const zeroPadNumber = (input: string = ""): string => {
  if (input.length === 1) {
    return "0" + input;
  }

  return input;
};

export const removeEmptyStringValues = (data: Record<string, any>, exclude: string[] = []): Record<string, any> => {
  for (const key in data) {
    if (exclude.includes(key)) {
      continue;
    }

    if (typeof data[key] === "object") {
      removeEmptyStringValues(data[key], exclude);
      continue;
    }

    if (typeof data[key] === "string" && data?.[key]?.trim() === "") {
      data[key] = null;
    }
  }

  return data;
};

export const validateAndFormatPersonDateOfBirth = (data: Record<string, any>) => {
  if (data["forename"] && data["date_of_birth-day"]) {
    // Only do this if Limited Partner Person data is being sent to the API
    data["date_of_birth"] = convertValidDateToIsoDateString({
      day: data["date_of_birth-day"],
      month: data["date_of_birth-month"],
      year: data["date_of_birth-year"]
    });
  }
};

export const validateAndFormatPartnerDateEffectiveFrom = (data: Record<string, any>) => {
  if (data["date_effective_from-day"]) {
    data["date_effective_from"] = convertValidDateToIsoDateString({
      day: data["date_effective_from-day"],
      month: data["date_effective_from-month"],
      year: data["date_effective_from-year"]
    });
  }
};

export const validateAndFormatPartnerDateOfUpdate = (data: Record<string, any>) => {
  if (data["date_of_update-day"]) {
    data["date_of_update"] = convertValidDateToIsoDateString({
      day: data["date_of_update-day"],
      month: data["date_of_update-month"],
      year: data["date_of_update-year"]
    });
  }
};

export const validateAndFormatPartnerCeaseDate = (data: Record<string, any>) => {
  if (data["cease_date-day"]) {
    data["cease_date"] = convertValidDateToIsoDateString({
      day: data["cease_date-day"],
      month: data["cease_date-month"],
      year: data["cease_date-year"]
    });
  }
};

export const resetFormerNamesIfPreviousNameIsFalse = (data: Record<string, any>) => {
  if (data?.former_names && data?.previous_name === "false") {
    data.former_names = "";
  }
};

export const validateFormerNamesNotEmptyIfPreviousNameIsTrue = (data: Record<string, any>, partnerType: string) => {
  if (data?.previous_name === "true" && (!data?.former_names || data?.former_names.trim() === "")) {
    const uiErrors = new UIErrors();
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        former_names: `Enter the previous name(s) of the ${partnerType} partner`
      }
    });

    throw uiErrors;
  }
};

export const snakeToNormalCase = (str: string): string => {
  if (!str) {
    return str;
  }

  return str.replace(/_+/g, " ").trim().toLowerCase();
};

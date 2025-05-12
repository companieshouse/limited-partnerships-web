import UIErrors from "../../domain/entities/UIErrors";

export const convertValidDateToIsoDateString = (
  date: { day: string; month: string; year: string },
  fieldName: string
): string => {
  const dateStr = convertDateToIsoDateString(
    date.day.trim(),
    date.month.trim(),
    date.year.trim()
  );

  if (!isDateValid(dateStr)) {
    const uiErrors = new UIErrors();
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        [fieldName]: "The date is not valid"
      }
    });

    throw uiErrors;
  }

  return dateStr;
};

const convertDateToIsoDateString = (day: string, month: string, year: string): string => {
  return `${year}-${zeroPadNumber(month)}-${zeroPadNumber(day)}`;
};

const zeroPadNumber = (input: string = ""): string => {
  if (input.length === 1) {
    return "0" + input;
  }

  return input;
};

const isDateValid = (date: string): boolean => {
  const [year, month, day] = date.split("-");

  const isMonthInvalid = isNaN(parseInt(month));
  const isYearInvalid = isNaN(parseInt(year)) || year.length !== 4;

  if (isMonthInvalid || isYearInvalid) {
    return false;
  }

  const days = daysInMonth(parseInt(month));

  if (!day.length || parseInt(day) > days) {
    return false;
  }

  const dateObj = new Date(date);
  const now = new Date();
  const dateInPast = dateObj < now;

  return dateObj instanceof Date && !isNaN(dateObj.getTime()) && dateInPast;
};

const daysInMonth = (month: number) => {
  const thirtyOneDayMonths = [1, 3, 5, 7, 8, 10, 12];
  const thirtyDayMonths = [4, 6, 9, 11];

  if (thirtyOneDayMonths.includes(month)) {
    return 31;
  } else if (thirtyDayMonths.includes(month)) {
    return 30;
  } else {
    return 28;
  }
};

export const removeEmptyStringValues = (
  data: Record<string, any>,
  exclude: string[] = []
): Record<string, any> => {
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

export const validateAndFormatPartnerPersonDateOfBirth = (data: Record<string, any>) => {
  if (data["forename"]) {
    // Only do this if Limited Partner Person data is being sent to the API
    data["date_of_birth"] = convertValidDateToIsoDateString(
      {
        day: data["date_of_birth-day"],
        month: data["date_of_birth-month"],
        year: data["date_of_birth-year"]
      },
      "date_of_birth"
    );
  }
};

import UIErrors from "../../domain/entities/UIErrors";

export const convertValidDateToIsoDateString = (
  date: { day: string; month: string; year: string },
  fieldName: string
): string => {
  const dateStr = convertDateToIsoDateString(date.day, date.month, date.year);

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
  const days = daysInMonth(parseInt(month));

  const isYearInCorrect = isNaN(parseInt(year)) || year.length !== 4;

  if (parseInt(day) > days || isYearInCorrect) {
    return false;
  }

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
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

export const removeEmptyStringValues = (data: Record<string, any>): Record<string, any> => {
  for (const key in data) {
    if (data[key] === "") {
      data[key] = null;
    }
  }

  return data;
};

export const convertDateToIsoDateString = (day: string, month: string, year: string): string => {
  return `${year}-${zeroPadNumber(month)}-${zeroPadNumber(day)}`;
};

export const removeEmptyStringValues = (data: Record<string, any>): Record<string, any> => {
  for (const key in data) {
    if (data[key] === "") {
      data[key] = null;
    }
  }

  return data;
};

const zeroPadNumber = (input: string = ""): string => {
  if (input.length === 1) {
    return "0" + input;
  }

  return input;
};

const convertDateToIsoDateString = (day: string, month: string, year: string): string => {
  return `${year}-${zeroPadNumber(month)}-${zeroPadNumber(day)}`;
};

const zeroPadNumber = (input: string = ""): string => {
  if (input.length === 1) {
    return "0" + input;
  }

  return input;
};

export default convertDateToIsoDateString;

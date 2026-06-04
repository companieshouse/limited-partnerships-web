import { dateContainsInvalidChars, isDateInPast, isDateToday, isValidDate, isValidDateStringAndNotInFuture, validateDateOfBirth, DateErrorMessages } from '../../../../domain/validator/DateValidators';
import { DATE_OF_BIRTH_FIELD } from '../../../../config';

describe('isValidDate', () => {
  it('returns true for a valid date', () => {
    expect(isValidDate('21', '05', '2026')).toBe(true);
  });

  it('returns true for leap day in a leap year', () => {
    expect(isValidDate('29', '02', '2024')).toBe(true);
  });

  it('returns false for leap day in a non-leap year', () => {
    expect(isValidDate('29', '02', '2023')).toBe(false);
  });

  it('returns false for invalid day-month combinations', () => {
    expect(isValidDate('31', '04', '2026')).toBe(false);
    expect(isValidDate('31', '11', '2026')).toBe(false);
  });

  it('returns false for impossible day and month values', () => {
    expect(isValidDate('00', '01', '2026')).toBe(false);
    expect(isValidDate('01', '00', '2026')).toBe(false);
    expect(isValidDate('32', '01', '2026')).toBe(false);
    expect(isValidDate('01', '13', '2026')).toBe(false);
  });

  it('returns false for non-numeric input', () => {
    expect(isValidDate('aa', '01', '2026')).toBe(false);
    expect(isValidDate('01', 'bb', '2026')).toBe(false);
    expect(isValidDate('01', '01', 'cccc')).toBe(false);
  });
});

describe('isDateInPast', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for a date before today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isDateInPast('20', '05', '2026')).toBe(true);
  });

  it('returns false for today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isDateInPast('21', '05', '2026')).toBe(false);
  });

  it('returns false for a future date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isDateInPast('22', '05', '2026')).toBe(false);
  });

  it('returns false for invalid date values', () => {
    expect(isDateInPast('32', '13', 'abcd')).toBe(false);
  });

  it('uses Date.UTC to compare date-only values', () => {
    jest.useFakeTimers();
    // month is zero based in JS Date, so 4 = May
    const mockedNow = new Date(2026, 4, 21, 23, 59, 59);
    jest.setSystemTime(mockedNow);
    const utcSpy = jest.spyOn(Date, 'UTC');

    try {
      expect(isDateInPast('20', '05', '2026')).toBe(true);
      expect(utcSpy).toHaveBeenNthCalledWith(1, 2026, 4, 20);
      expect(utcSpy).toHaveBeenNthCalledWith(2, 2026, 4, 21);
      expect(utcSpy).toHaveBeenCalledTimes(2);
    } finally {
      utcSpy.mockRestore();
    }
  });

  it('handles spring-forward day boundary without timezone drift', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 29, 0, 30, 0));

    expect(isDateInPast('28', '03', '2026')).toBe(true);
    expect(isDateInPast('29', '03', '2026')).toBe(false);
    expect(isDateInPast('30', '03', '2026')).toBe(false);
  });
});

describe('isValidDateStringAndNotInFuture', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for a valid date in the past', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isValidDateStringAndNotInFuture('2026-05-20')).toBe(true);
  });

  it('returns true for today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isValidDateStringAndNotInFuture('2026-05-21')).toBe(true);
  });

  it('returns false for a future date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

    expect(isValidDateStringAndNotInFuture('2026-05-22')).toBe(false);
  });

  it('returns false for invalid date strings', () => {
    expect(isValidDateStringAndNotInFuture('2026-02-29')).toBe(false);
    expect(isValidDateStringAndNotInFuture('2026-04-31')).toBe(false);
  });

  it('returns false when day length is too long', () => {
    expect(isValidDateStringAndNotInFuture('2026-05-021')).toBe(false);
  });

  it('returns false when month length is too long', () => {
    expect(isValidDateStringAndNotInFuture('2026-005-21')).toBe(false);
  });

  it('returns false when year length is not four', () => {
    expect(isValidDateStringAndNotInFuture('26-05-21')).toBe(false);
    expect(isValidDateStringAndNotInFuture('20266-05-21')).toBe(false);
  });
});

describe('dateContainsInvalidChars', () => {
  it('returns true when day contains non-numeric characters', () => {
    expect(dateContainsInvalidChars('aa', '05', '2026')).toBe(true);
  });

  it('returns true when month contains non-numeric characters', () => {
    expect(dateContainsInvalidChars('21', 'bb', '2026')).toBe(true);
  });

  it('returns true when year contains non-numeric characters', () => {
    expect(dateContainsInvalidChars('21', '05', 'cccc')).toBe(true);
  });

  it('returns true when date contains full stop', () => {
    expect(dateContainsInvalidChars('2.', '05', '2025')).toBe(true);
    expect(dateContainsInvalidChars('21', '05.', '2025')).toBe(true);
    expect(dateContainsInvalidChars('21', '05', '202.')).toBe(true);
  });

  it('returns false when all values are numeric', () => {
    expect(dateContainsInvalidChars('21', '05', '2026')).toBe(false);
  });

  it('returns false when values are empty strings', () => {
    expect(dateContainsInvalidChars('', '', '')).toBe(false);
  });
});

describe('isDateToday', () => {
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  it('uses Date.UTC to compare date-only values', () => {
    jest.useFakeTimers();
    // month is zero based in JS Date, so 4 = May
    const mockedNow = new Date(2026, 4, 21, 23, 59, 59);
    jest.setSystemTime(mockedNow);
    const utcSpy = jest.spyOn(Date, 'UTC');

    try {
      expect(isDateToday('21', '05', '2026')).toBe(true);
      expect(utcSpy).toHaveBeenNthCalledWith(1, 2026, 4, 21);
      expect(utcSpy).toHaveBeenNthCalledWith(2, 2026, 4, 21);
      expect(utcSpy).toHaveBeenCalledTimes(2);
    } finally {
      utcSpy.mockRestore();
      jest.useRealTimers();
    }
  });

  describe('daylight saving boundaries', () => {
    const assertIsDateToday = (date: Date, expected: boolean) => {
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear().toString();
      expect(isDateToday(day, month, year)).toBe(expected);
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it('handles spring-forward day at local 00:30', () => {
      jest.useFakeTimers();
      const now = new Date(2026, 2, 29, 0, 30, 0);
      jest.setSystemTime(now);

      const yesterday = new Date(2026, 2, 28);
      const tomorrow = new Date(2026, 2, 30);

      assertIsDateToday(now, true);
      assertIsDateToday(yesterday, false);
      assertIsDateToday(tomorrow, false);
    });

    it('handles spring-forward day at local 23:30', () => {
      jest.useFakeTimers();
      const now = new Date(2026, 2, 29, 23, 30, 0);
      jest.setSystemTime(now);

      const yesterday = new Date(2026, 2, 28);
      const tomorrow = new Date(2026, 2, 30);

      assertIsDateToday(now, true);
      assertIsDateToday(yesterday, false);
      assertIsDateToday(tomorrow, false);
    });

    it('handles fall-back day at local 00:30', () => {
      jest.useFakeTimers();
      const now = new Date(2026, 9, 25, 0, 30, 0);
      jest.setSystemTime(now);

      const yesterday = new Date(2026, 9, 24);
      const tomorrow = new Date(2026, 9, 26);

      assertIsDateToday(now, true);
      assertIsDateToday(yesterday, false);
      assertIsDateToday(tomorrow, false);
    });

    it('handles fall-back day at local 23:30', () => {
      jest.useFakeTimers();
      const now = new Date(2026, 9, 25, 23, 30, 0);
      jest.setSystemTime(now);

      const yesterday = new Date(2026, 9, 24);
      const tomorrow = new Date(2026, 9, 26);

      assertIsDateToday(now, true);
      assertIsDateToday(yesterday, false);
      assertIsDateToday(tomorrow, false);
    });
  });

  it('returns true for today\'s date', () => {
    const day = pad(today.getDate());
    const month = pad(today.getMonth() + 1); // JS months are 0-indexed
    const year = today.getFullYear().toString();
    expect(isDateToday(day, month, year)).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const day = pad(yesterday.getDate());
    const month = pad(yesterday.getMonth() + 1);
    const year = yesterday.getFullYear().toString();
    expect(isDateToday(day, month, year)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const day = pad(tomorrow.getDate());
    const month = pad(tomorrow.getMonth() + 1);
    const year = tomorrow.getFullYear().toString();
    expect(isDateToday(day, month, year)).toBe(false);
  });

  it('returns false for invalid date', () => {
    expect(isDateToday('32', '13', 'abcd')).toBe(false);
  });

  it('returns false for missing fields', () => {
    expect(isDateToday('', '', '')).toBe(false);
    expect(isDateToday('01', '', '2020')).toBe(false);
    expect(isDateToday('', '01', '2020')).toBe(false);
    expect(isDateToday('01', '01', '')).toBe(false);
  });
});

describe('validateDateOfBirth', () => {
  let mockUIErrors: any;
  const testErrorMessages: DateErrorMessages = {
    dateMissing: 'Date of birth is missing',
    dayMissing: 'Day is missing',
    monthMissing: 'Month is missing',
    yearMissing: 'Year is missing',
    dayAndMonthMissing: 'Day and month are missing',
    dayAndYearMissing: 'Day and year are missing',
    monthAndYearMissing: 'Month and year are missing',
    dayInvalidLength: 'Day is invalid length',
    monthInvalidLength: 'Month is invalid length',
    yearInvalidLength: 'Year is invalid length',
    dateInvalidChars: 'Date contains invalid characters',
    dateInvalidDate: 'Date is invalid',
    dateNotInPast: 'Date of birth is not in the past'
  };

  beforeEach(() => {
    mockUIErrors = {
      setWebError: jest.fn()
    };
  });

  describe('missing date fields', () => {
    it('sets error when all fields are missing', () => {
      validateDateOfBirth(undefined, undefined, undefined, mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateMissing);
    });

    it('sets error when day is missing', () => {
      validateDateOfBirth(undefined, '05', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dayMissing);
    });

    it('sets error when month is missing', () => {
      validateDateOfBirth('21', undefined, '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.monthMissing);
    });

    it('sets error when year is missing', () => {
      validateDateOfBirth('21', '05', undefined, mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.yearMissing);
    });

    it('sets error when day and month are missing', () => {
      validateDateOfBirth(undefined, undefined, '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dayAndMonthMissing);
    });

    it('sets error when day and year are missing', () => {
      validateDateOfBirth(undefined, '05', undefined, mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dayAndYearMissing);
    });

    it('sets error when month and year are missing', () => {
      validateDateOfBirth('21', undefined, undefined, mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.monthAndYearMissing);
    });

    it('treats empty strings as missing', () => {
      validateDateOfBirth('', '', '', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateMissing);
    });

    it('treats whitespace-only strings as missing', () => {
      validateDateOfBirth('   ', '   ', '   ', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateMissing);
    });
  });

  describe('invalid field lengths', () => {
    it('sets error when day is too long', () => {
      validateDateOfBirth('021', '05', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dayInvalidLength);
    });

    it('sets error when month is too long', () => {
      validateDateOfBirth('21', '005', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.monthInvalidLength);
    });

    it('sets error when year is not exactly 4 digits', () => {
      validateDateOfBirth('21', '05', '20', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.yearInvalidLength);
    });

    it('sets error when year has more than 4 digits', () => {
      validateDateOfBirth('21', '05', '20000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.yearInvalidLength);
    });

    it('allows year with exactly 4 digits', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('20', '05', '2026', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.yearInvalidLength);

      jest.useRealTimers();
    });
  });

  describe('invalid characters', () => {
    it('sets error when day contains non-numeric characters', () => {
      validateDateOfBirth('aa', '05', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidChars);
    });

    it('sets error when month contains non-numeric characters', () => {
      validateDateOfBirth('21', 'bb', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidChars);
    });

    it('sets error when year contains non-numeric characters', () => {
      validateDateOfBirth('21', '05', 'cccc', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidChars);
    });
  });

  describe('invalid dates', () => {
    it('sets error for leap day in a non-leap year', () => {
      validateDateOfBirth('29', '02', '2023', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });

    it('sets error for impossible day-month combinations', () => {
      validateDateOfBirth('31', '04', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });

    it('sets error for day 0', () => {
      validateDateOfBirth('00', '01', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });

    it('sets error for month 0', () => {
      validateDateOfBirth('21', '00', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });

    it('sets error for day 32', () => {
      validateDateOfBirth('32', '01', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });

    it('sets error for month 13', () => {
      validateDateOfBirth('21', '13', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateInvalidDate);
    });
  });

  describe('date not in past', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('sets error for a future date', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('22', '05', '2026', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateNotInPast);
    });

    it('sets error for today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('21', '05', '2026', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledWith(DATE_OF_BIRTH_FIELD, testErrorMessages.dateNotInPast);
    });
  });

  describe('valid past dates', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not set error for a valid date in the past', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('20', '05', '2026', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });

    it('does not set error for a valid date many years in the past', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('21', '05', '1990', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });

    it('does not set error for leap day in a leap year in the past', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('29', '02', '2024', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });

    it('does not set error for the last valid day of each month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      // April has 30 days
      validateDateOfBirth('30', '04', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('handles null values by treating them as undefined', () => {
      validateDateOfBirth(null as any, null as any, null as any, mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalled();
    });

    it('stops validation at the first error (missing fields check)', () => {
      validateDateOfBirth('', '', '', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledTimes(1);
    });

    it('stops validation at the first error (length check)', () => {
      validateDateOfBirth('321', '05', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledTimes(1);
    });

    it('stops validation at the first error (invalid chars check)', () => {
      validateDateOfBirth('2a', '05', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledTimes(1);
    });

    it('stops validation at the first error (invalid date check)', () => {
      validateDateOfBirth('31', '04', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).toHaveBeenCalledTimes(1);
    });

    it('accepts valid date with leading zeros', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('01', '01', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });

    it('accepts valid date without leading zeros', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 4, 21, 10, 0, 0));

      validateDateOfBirth('1', '1', '2000', mockUIErrors, testErrorMessages);
      expect(mockUIErrors.setWebError).not.toHaveBeenCalled();
    });
  });
});

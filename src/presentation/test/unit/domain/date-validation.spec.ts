import { dateContainsInvalidChars, isDateInPast, isDateToday, isValidDate, isValidDateStringAndNotInFuture } from '../../../../domain/validator/DateValidators';

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

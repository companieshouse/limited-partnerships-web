import { DATE_OF_BIRTH_FIELD } from "../../../../config";
import UIErrors from "../../../../domain/entities/UIErrors";
import { validateDate } from "../../../../domain/validator/DateValidators";
import { convertValidDateToIsoDateString, removeEmptyStringValues } from "../../../../infrastructure/gateway/utils";
import { enTranslationText } from "../../../../test/utils/locales";

describe("Gateway utils test suite", () => {
  describe("Date validation tests", () => {
    describe("ISO date conversion tests", () => {});

    describe("Date validation tests", () => {
      it("should build date string and correctly pad day field", () => {
        const date: string = convertValidDateToIsoDateString({ day: "1", month: "12", year: "2011" });

        expect(date).toBe("2011-12-01");
      });

      it("should build date string and correctly pad month field", () => {
        const date: string = convertValidDateToIsoDateString({ day: "26", month: "4", year: "2011" });

        expect(date).toBe("2011-04-26");
      });

      it.each([
        ["day", { day: " 11 ", month: "03", year: "1980" }],
        ["month", { day: "11", month: " 03 ", year: "1980" }],
        ["year", { day: "11", month: "03", year: " 1980 " }]
      ])("it should format the date and trim leading and trailing spaces from the %s", (_decription, date) => {
        const result: string = convertValidDateToIsoDateString(date);

        expect(result).toBe("1980-03-11");
      });

      // failing scenarios
      it.each([
        ["day above 31", { day: "32", month: "10", year: "2011" }],
        ["month above 12", { day: "01", month: "13", year: "2011" }],
        ["day 31 for month of 30", { day: "31", month: "11", year: "2011" }],
        ["30 february", { day: "30", month: "02", year: "2011" }],
        ["day invalid not a number", { day: "wrong", month: "10", year: "2011" }],
        ["month invalid not a number", { day: "01", month: "OAT", year: "2011" }],
        ["month abbreviation but not a number", { day: "11", month: "OCT", year: "2023" }],
        ["month full word but not a number", { day: "11", month: "OCTOBER", year: "2023" }],
        ["year invalid not a number", { day: "01", month: "10", year: "wrong" }],
        ["year above 4 digits", { day: "01", month: "10", year: "12345" }],
        ["date in future", { day: "11", month: "03", year: "2050" }],
        ["space as day", { day: " ", month: "03", year: "1980" }],
        ["space as month", { day: "11", month: " ", year: "1980" }],
        ["space as year", { day: "11", month: "03", year: " " }],
        ["empty string as day", { day: "", month: "03", year: "1980" }],
        ["empty string as month", { day: "11", month: "", year: "1980" }],
        ["empty string as year", { day: "11", month: "03", year: "" }],
        ["day with 3 digits", { day: "001", month: "10", year: "2011" }],
        ["month with 3 digits", { day: "01", month: "012", year: "2011" }],
        ["all zeros", { day: "0", month: "0", year: "0000" }],
        ["day is zero", { day: "0", month: "10", year: "2011" }],
        ["month is zero", { day: "01", month: "0", year: "2011" }],
        ["year is zero", { day: "01", month: "10", year: "0000" }]
      ])("should return false for invalid date - %s", (_desciption, date) => {
        const thrownError: UIErrors = new UIErrors();

        validateDate(
          { day: date.day, month: date.month, year: date.year },
          thrownError,
          DATE_OF_BIRTH_FIELD,
          enTranslationText?.errorMessages?.dateOfBirth
        );

        expect(thrownError).toEqual(
          expect.objectContaining({
            errors: expect.objectContaining({
              date_of_birth: { text: expect.any(String) }
            })
          })
        );
      });
    });
  });

  describe("Data conversion tests", () => {
    it("should remove empty string values from input data", () => {
      let data: Record<string, any> = {
        field1: "value1",
        field2: "",
        field3: "value3",
        field4: 123,
        field5: undefined,
        field6: false,
        field7: { field7A: "" }
      };

      data = removeEmptyStringValues(data);

      expect(data).toStrictEqual({
        field1: "value1",
        field2: null,
        field3: "value3",
        field4: 123,
        field5: undefined,
        field6: false,
        field7: { field7A: null }
      });
    });
  });
});

import UIErrors from "../../../../domain/entities/UIErrors";
import {
  convertValidDateToIsoDateString,
  removeEmptyStringValues
} from "../../../../infrastructure/gateway/utils";

describe("Gateway utils test suite", () => {
  describe("Date validation tests", () => {
    describe("ISO date conversion tests", () => {});

    describe("Date validation tests", () => {
      it("should build date string and correctly pad day field", () => {
        const date: string = convertValidDateToIsoDateString(
          { day: "1", month: "12", year: "2011" },
          "date_of_birth"
        );

        expect(date).toBe("2011-12-01");
      });

      it("should build date string and correctly pad month field", () => {
        const date: string = convertValidDateToIsoDateString(
          { day: "26", month: "4", year: "2011" },
          "date_of_birth"
        );

        expect(date).toBe("2011-04-26");
      });

      it.each([
        ["day", { day: " 11 ", month: "03", year: "1980" }],
        ["month", { day: "11", month: " 03 ", year: "1980" }],
        ["year", { day: "11", month: "03", year: " 1980 " }]
      ])(
        "it should format the date and trim leading and trailing spaces from the %s",
        (_decription, date) => {
          const result: string = convertValidDateToIsoDateString(date, "date_of_birth");

          expect(result).toBe("1980-03-11");
        }
      );

      // failing scenarios
      it.each([
        ["day above 31", { day: "32", month: "10", year: "2011" }],
        ["month above 12", { day: "01", month: "13", year: "2011" }],
        ["day 31 for month of 30", { day: "31", month: "11", year: "2011" }],
        ["30 february", { day: "30", month: "02", year: "2011" }],
        ["day incorrect", { day: "wrong", month: "10", year: "2011" }],
        ["month incorrect", { day: "01", month: "wrong", year: "2011" }],
        ["year incorrect", { day: "01", month: "10", year: "wrong" }],
        ["year above 4 digits", { day: "01", month: "10", year: "12345" }],
        ["date in futur", { day: "11", month: "03", year: "2050" }],
        ["space as day", { day: " ", month: "03", year: "1980" }]
      ])("should return false for invalid date - %s", (_desciption, date) => {
        let thrownError: UIErrors | null = null;

        try {
          convertValidDateToIsoDateString(date, "date_of_birth");
        } catch (error) {
          thrownError = error;
        }

        expect(thrownError).toEqual(
          expect.objectContaining({
            errors: expect.objectContaining({
              date_of_birth: { text: "The date is not valid" }
            })
          })
        );
      });
    });
  });

  describe("Data conversion tests", () => {
    it("should remove empty string values from input data", () => {
      let data: Record<string, any> = { field1: "value1", field2: "", field3: "value3" };

      data = removeEmptyStringValues(data);

      expect(data).toStrictEqual({ field1: "value1", field2: null, field3: "value3" });
    });
  });
});

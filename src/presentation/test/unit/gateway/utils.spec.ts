import { convertDateToIsoDateString, removeEmptyStringValues } from "../../../../infrastructure/gateway/utils";

describe('Gateway utils test suite', () => {

  describe("ISO date conversion tests", () => {
    it('should build date string and correctly pad day field', () => {
      const date: string = convertDateToIsoDateString("1", "12", "2011");

      expect(date).toBe("2011-12-01");
    });

    it('should build date string and correctly pad month field', () => {
      const date: string = convertDateToIsoDateString("26", "4", "2011");

      expect(date).toBe("2011-04-26");
    });
  });

  describe("Data conversion tests", () => {
    it('should remove empty string values from input data', () => {
      let data: Record<string, any> = { "field1": "value1", "field2": "", "field3": "value3" };

      data = removeEmptyStringValues(data);

      expect(data).toStrictEqual({ "field1": "value1", "field2": null, "field3": "value3" });
    });
  });
});

import { normaliseNationality } from "./normaliseNationality";

describe("normaliseNationality", () => {
  it.each([
    ["BRITISH", "British"],
    ["CITIZEN OF GUINEA-BISSAU", "Citizen of Guinea-Bissau"],
    ["CONGOLESE (CONGO)", "Congolese (Congo)"],
    ["CONGOLESE (DRC)", "Congolese (DRC)"],
    ["CITIZEN OF ANTIGUA AND BARBUDA", "Citizen of Antigua and Barbuda"],
    ["VATICAN CITIZEN", "Vatican citizen"]
  ])("should normalise %s to %s", (input, expected) => {
    expect(normaliseNationality(input)).toEqual(expected);
  });

  it.each([
    ["British", "British"],
    ["Citizen of Guinea-Bissau", "Citizen of Guinea-Bissau"],
    ["Congolese (Congo)", "Congolese (Congo)"]
  ])("should preserve already normalised value %s", (input, expected) => {
    expect(normaliseNationality(input)).toEqual(expected);
  });

  it("should return empty string for empty input", () => {
    expect(normaliseNationality("")).toEqual("");
  });

  it("should return unrecognised nationality as-is", () => {
    expect(normaliseNationality("Unknown Nationality")).toEqual("Unknown Nationality");
  });
});

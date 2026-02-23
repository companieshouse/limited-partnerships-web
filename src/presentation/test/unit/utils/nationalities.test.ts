import setNationalitiesDropdown from "../../../../utils/nationalities";

const mockI18n = {
  nationalities: {
    british: "British",
    english: "English",
    northernIrish: "Northern Irish",
    scottish: "Scottish",
    welsh: "Welsh",
    afghan: "Afghan",
    french: "French",
    irish: "Irish"
  }
};

describe("setNationalitiesDropdown", () => {
  it("should include prompt text as first item", () => {
    const result = setNationalitiesDropdown(mockI18n, undefined, "Select a nationality");

    expect(result[0]).toEqual({ value: "", text: "Select a nationality" });
  });

  it("should place UK nationalities first", () => {
    const result = setNationalitiesDropdown(mockI18n, undefined, "Select");

    expect(result[1].value).toEqual("British");
    expect(result[2].value).toEqual("English");
    expect(result[3].value).toEqual("Northern Irish");
    expect(result[4].value).toEqual("Scottish");
    expect(result[5].value).toEqual("Welsh");
  });

  it("should place remaining nationalities after UK ones", () => {
    const result = setNationalitiesDropdown(mockI18n, undefined, "Select");

    const nonUkValues = result.slice(6).map((item) => item.value);
    expect(nonUkValues).toEqual(["Afghan", "French", "Irish"]);
  });

  it("should perform case-insensitive matching", () => {
    const result = setNationalitiesDropdown(mockI18n, "BRITISH", "Select");

    const britishItem = result.find((item) => item.value === "British");
    expect(britishItem?.selected).toBe(true);
  });

  it("should perform case-insensitive matching for multi-word nationalities", () => {
    const result = setNationalitiesDropdown(mockI18n, "NORTHERN IRISH", "Select");

    const item = result.find((item) => item.value === "Northern Irish");
    expect(item?.selected).toBe(true);
  });

  it("should return all items unselected when no match", () => {
    const result = setNationalitiesDropdown(mockI18n, "Unknown", "Select");

    const selectedItems = result.filter((item) => item.selected);
    expect(selectedItems).toHaveLength(0);
  });

  it("should return all items unselected when nationalityField is undefined", () => {
    const result = setNationalitiesDropdown(mockI18n, undefined, "Select");

    const selectedItems = result.filter((item) => item.selected);
    expect(selectedItems).toHaveLength(0);
  });

  it("should use locale value for both value and text", () => {
    const result = setNationalitiesDropdown(mockI18n, undefined, "Select");

    const frenchItem = result.find((item) => item.value === "French");
    expect(frenchItem?.text).toEqual("French");
  });
});

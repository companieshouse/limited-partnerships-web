import AddressValidator from "../../../../domain/entities/Address";

import enTranslationText from "../../../../../locales/en/errors.json";

const defaultAddress = {
  premises: "123",
  address_line_1: "Main Street",
  locality: "town",
  postal_code: "AA1 1AA",
  country: "England"
};

describe("Address validation", () => {
  it.each([
    ["UK address", defaultAddress],
    [
      "overseas address",
      {
        ...defaultAddress,
        postal_code: "31100",
        country: "France"
      }
    ],
    [
      "overseas address without postcode",
      {
        premises: "123",
        address_line_1: "Main Street",
        locality: "town",
        country: "France"
      }
    ]
  ])("should return no errors for valid %s", (_description: string, address: Record<string, string>) => {
    const addressValidator = new AddressValidator(address, enTranslationText);
    const errors = addressValidator.runValidation();

    expect(errors.hasErrors()).toBe(false);
    expect(errors.getErrors()).toEqual({ errorList: [] });
  });

  it.each([
    ["invalid uk postcode", { ...defaultAddress, postal_code: "AA1 1AA AAA" }, "Invalid postcode format"],
    [
      "uk postcode not mainland",
      { ...defaultAddress, postal_code: "JE1 1AA", country: "England" },
      "Enter a UK mainland postcode"
    ]
  ])("should return errors for %s", (_description: string, address: Record<string, string>, errorMessage: string) => {
    const addressValidator = new AddressValidator(address, enTranslationText);
    const errors = addressValidator.runValidation();

    expect(errors.hasErrors()).toBe(true);
    expect(errors.getErrors()).toEqual({
      postal_code: {
        text: errorMessage
      },
      errorList: [
        {
          href: "#postal_code",
          text: errorMessage
        }
      ]
    });
  });

  it("should return errors for empty fields", () => {
    const addressValidator = new AddressValidator({}, enTranslationText);
    const errors = addressValidator.runValidation();

    expect(errors.hasErrors()).toBe(true);
    expect(errors.getErrors()).toEqual(
      expect.objectContaining({
        premises: {
          text: "Enter a property name or number"
        },
        address_line_1: {
          text: "Enter address line 1, typically the building and street"
        },
        locality: {
          text: "Enter a town or city"
        },
        postal_code: {
          text: "Enter a postcode"
        },
        country: {
          text: "Select a country"
        },

        errorList: expect.arrayContaining([
          {
            href: "#premises",
            text: "Enter a property name or number"
          },
          {
            href: "#address_line_1",
            text: "Enter address line 1, typically the building and street"
          },
          {
            href: "#locality",
            text: "Enter a town or city"
          },
          {
            href: "#postal_code",
            text: "Enter a postcode"
          },
          {
            href: "#country",
            text: "Select a country"
          }
        ])
      })
    );
  });

  it("should return errors for invalids characters", () => {
    const addressValidator = new AddressValidator(
      {
        premises: "~",
        address_line_1: "~",
        address_line_2: "~",
        region: "~",
        locality: "~",
        postal_code: "~",
        country: "~"
      },
      enTranslationText
    );
    const errors = addressValidator.runValidation();

    expect(errors.hasErrors()).toBe(true);
    expect(errors.getErrors()).toEqual(
      expect.objectContaining({
        premises: {
          text: "Property name or number must only include letters a to z, numbers and common special characters such as hyphens, spaces and apostrophes"
        },
        address_line_1: {
          text: "Address line 1 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
        },
        address_line_2: {
          text: "Address line 2 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
        },
        region: {
          text: "County must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
        },
        locality: {
          text: "Town or city must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
        },
        postal_code: {
          text: "Postcode must only include letters a to z, numbers and spaces"
        },

        errorList: expect.arrayContaining([
          {
            href: "#premises",
            text: "Property name or number must only include letters a to z, numbers and common special characters such as hyphens, spaces and apostrophes"
          },
          {
            href: "#address_line_1",
            text: "Address line 1 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
          },
          {
            href: "#address_line_2",
            text: "Address line 2 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
          },
          {
            href: "#region",
            text: "County must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
          },
          {
            href: "#locality",
            text: "Town or city must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes"
          },
          {
            href: "#postal_code",
            text: "Postcode must only include letters a to z, numbers and spaces"
          }
        ])
      })
    );
  });

  it("should return errors when fileds exceed character limit", () => {
    const addressValidator = new AddressValidator(
      {
        premises: "a".repeat(201),
        address_line_1: "a".repeat(51),
        address_line_2: "a".repeat(51),
        region: "a".repeat(51),
        locality: "a".repeat(51),
        postal_code: "a".repeat(21),
        country: "UK"
      },
      enTranslationText
    );
    const errors = addressValidator.runValidation();

    expect(errors.hasErrors()).toBe(true);
    expect(errors.getErrors()).toEqual(
      expect.objectContaining({
        premises: {
          text: "Property name or number must be 200 characters or less"
        },
        address_line_1: {
          text: "Address line 1 must be 50 characters or less"
        },
        address_line_2: {
          text: "Address line 2 must be 50 characters or less"
        },
        region: {
          text: "County must be 50 characters or less"
        },
        locality: {
          text: "Town or city must be 50 characters or less"
        },
        postal_code: {
          text: "Postcode must be 20 characters or less"
        },

        errorList: expect.arrayContaining([
          {
            href: "#premises",
            text: "Property name or number must be 200 characters or less"
          },
          {
            href: "#address_line_1",
            text: "Address line 1 must be 50 characters or less"
          },
          {
            href: "#address_line_2",
            text: "Address line 2 must be 50 characters or less"
          },
          {
            href: "#region",
            text: "County must be 50 characters or less"
          },
          {
            href: "#locality",
            text: "Town or city must be 50 characters or less"
          },
          {
            href: "#postal_code",
            text: "Postcode must be 20 characters or less"
          }
        ])
      })
    );
  });
});

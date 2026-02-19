import translations from "../../../../locales/en/translations.json";

// Build a case-insensitive lookup map from the English locale nationality values.
// This ensures nationality strings from external APIs (which may differ in casing)
// are normalised to the canonical form used by the nationality dropdown.
const nationalityMap = new Map<string, string>(
  Object.values(translations.nationalities).map((value) => [value.toLowerCase(), value])
);

export function normaliseNationality(value: string): string {
  if (!value) {
    return value;
  }
  return nationalityMap.get(value.toLowerCase().trim()) ?? value;
}

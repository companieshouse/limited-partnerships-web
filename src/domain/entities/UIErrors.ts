export type UIValidationErrors = {
  errorList: {
    href: string;
    text: string;
  }[];
};

export type ApiErrors = { errors: Record<string, string> };

class UIErrors {
  apiErrors: ApiErrors;
  errors: UIValidationErrors = { errorList: [] };

  formatValidationErrorToUiErrors(apiErrors: ApiErrors) {
    this.apiErrors = apiErrors;
    const list = apiErrors.errors;

    for (const property in list) {
      const href = this.formatHrefValue(property);

      this.errors.errorList.push({
        href: `#${href}`,
        text: list[property]
      });
    }
  }

  private formatHrefValue(property: string): string {
    if (property === "data") {
      return "";
    }

    if (property.includes("data.")) {
      return property.replace("data.", "");
    }

    return property;
  }
}

export default UIErrors;

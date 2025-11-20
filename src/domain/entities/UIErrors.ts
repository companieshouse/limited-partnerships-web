export type UIValidationErrors = {
  [key: string]: {
    text: string;
  };
} & {
  errorList: {
    href: string;
    text: string;
  }[];
};

export type ApiErrors = { errors: Record<string, string> };

class UIErrors {
  apiErrors: ApiErrors;
  errors: UIValidationErrors = { errorList: [] } as any;

  formatValidationErrorToUiErrors(apiErrors: ApiErrors) {
    this.apiErrors = { ...this.apiErrors, ...apiErrors };
    const list = apiErrors?.errors ?? {};

    for (const property in list) {
      const href = this.formatHrefValue(property);

      this.errors[href] = {
        text: list[property]
      };

      this.errors.errorList.push({
        href: `#${href}`,
        text: list[property]
      });
    }
  }

  public hasErrors(): boolean {
    return this.errors.errorList.length > 0;
  }

  private formatHrefValue(property: string): string {
    if (property === "data") {
      return "";
    }

    if (property.includes("data.")) {
      return this.camelToSnakeCase(property.replace("data.", ""));
    }

    return this.camelToSnakeCase(property);
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

export default UIErrors;

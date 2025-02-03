import { LocalesService } from "@companieshouse/ch-node-utils";

import * as config from "../../config/constants";
import { appDevDependencies } from "../../config/dev-dependencies";

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};

export const getUrl = (url: string) =>
  appDevDependencies.addressLookUpController.insertIdsInUrl(
    url,
    appDevDependencies.transactionGateway.transactionId,
    appDevDependencies.limitedPartnershipGateway.submissionId
  );

const singleQuoteToHtml = (input: string) => {
  return input.replace(/'/g, "&#39;");
};

export const testTranslations = (
  text: string,
  translations: Record<string, any>
) => {
  for (const key in translations) {
    if (typeof translations[key] === "object") {
      testTranslations(text, translations[key]);
      continue;
    }

    const str = key.toLowerCase().includes("hint")
      ? singleQuoteToHtml(translations[key])
      : translations[key];

    expect(text).toContain(str);
  }
};

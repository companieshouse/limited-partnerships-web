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

const toEscapedHtml = (input: string) => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const testTranslations = (
  text: string,
  translations: Record<string, any>,
  exclude?: string[]
) => {
  for (const key in translations) {
    if (exclude?.includes(key)) {
      continue;
    }

    if (typeof translations[key] === "object") {
      testTranslations(text, translations[key]);
      continue;
    }

    const str = toEscapedHtml(translations[key]);

    expect(text).toContain(str);
  }
};

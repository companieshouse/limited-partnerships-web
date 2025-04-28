import { LocalesService } from "@companieshouse/ch-node-utils";

import * as config from "../../config/constants";
import { appDevDependencies } from "../../config/dev-dependencies";

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};

export const getUrl = (url: string) => {
  const submissionId = url.includes(config.SUBMISSION_ID)
    ? appDevDependencies.limitedPartnershipGateway.submissionId
    : "";
  const generalPartnerId = url.includes(config.GENERAL_PARTNER_ID)
    ? appDevDependencies.generalPartnerGateway.generalPartnerId
    : "";
  const limitedPartnerId = url.includes(config.LIMITED_PARTNER_ID)
    ? appDevDependencies.limitedPartnerGateway.limitedPartnerId
    : "";

  return appDevDependencies.addressLookUpController.insertIdsInUrl(
    url,
    appDevDependencies.transactionGateway.transactionId,
    submissionId,
    generalPartnerId,
    limitedPartnerId
  );
};

export const toEscapedHtml = (input: string) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const testTranslations = (text: string, translations: Record<string, any>, exclude?: string[]) => {
  for (const key in translations) {
    if (exclude?.includes(key)) {
      continue;
    }

    if (typeof translations[key] === "object") {
      testTranslations(text, translations[key], exclude);
      continue;
    }

    const str = toEscapedHtml(translations[key]);

    expect(text).toContain(str);
  }
};

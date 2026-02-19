import { LocalesService } from "@companieshouse/ch-node-utils";
import { LimitedPartner, GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import * as config from "../../config/constants";
import { appDevDependencies } from "../../config/dev-dependencies";
import GeneralPartnerBuilder from "./builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "./builder/LimitedPartnerBuilder";
import request from "supertest";

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};

export const getUrl = (url: string) => {
  const companyId = url.includes(config.COMPANY_ID) ? "LP123456" : "";
  const submissionId = url.includes(config.SUBMISSION_ID)
    ? appDevDependencies.limitedPartnershipGateway.submissionId
    : "";
  const generalPartnerId = url.includes(config.GENERAL_PARTNER_ID)
    ? appDevDependencies.generalPartnerGateway.generalPartnerId
    : "";
  const limitedPartnerId = url.includes(config.LIMITED_PARTNER_ID)
    ? appDevDependencies.limitedPartnerGateway.limitedPartnerId
    : "";
  const appointmentId = url.includes(config.APPOINTMENT_ID) ? "AP123456" : "";

  const ids = {
    companyId,
    transactionId: appDevDependencies.transactionGateway.transactionId,
    submissionId,
    generalPartnerId,
    limitedPartnerId,
    appointmentId
  };
  return appDevDependencies.addressLookUpController.insertIdsInUrl(url, ids);
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

export const setupPartners = (isLimitedPartner: boolean, isPerson: boolean) => {
  let partner: LimitedPartner | GeneralPartner;

  if (isLimitedPartner) {
    partner = isPerson
      ? new LimitedPartnerBuilder().isPerson().build()
      : new LimitedPartnerBuilder().isLegalEntity().build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([partner]);
    return { limitedPartner: partner, generalPartner: undefined };
  } else {
    partner = isPerson
      ? new GeneralPartnerBuilder().isPerson().build()
      : new GeneralPartnerBuilder().isLegalEntity().build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);
    return { limitedPartner: undefined, generalPartner: partner };
  }
};

export const expectPartnerData = (res: request.Response, partner: LimitedPartner | GeneralPartner, isPerson: boolean) => {

  if (isPerson) {
    expect(res.text).toContain(partner.data?.forename);
    expect(res.text).toContain(partner.data?.surname);
  } else {
    expect(res.text).toContain(partner.data?.legal_entity_name);
  }
};

export const countOccurrences = (text: string, target: string): number => {
  return text.split(target).length - 1;
};

export const expectChangeLinks = (text: string, changeLink: string[]) => {
  changeLink.forEach(link => {
    expect(text).toContain(getUrl(link));
  });
};

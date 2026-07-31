import { LocalesService } from "@companieshouse/ch-node-utils";
import { LimitedPartner, GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import * as config from "../../config/constants";
import { appDevDependencies } from "../../config/dev-dependencies";
import GeneralPartnerBuilder from "./builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "./builder/LimitedPartnerBuilder";
import request from "supertest";
import PersonWithSignificantControlBuilder from "./builder/PersonWithSignificantControlBuilder";
import { formatDate } from "../../utils/date-format";

type CheckPartnerValuesInTextOptions = {
  capitalizeKeys?: string[];
  dateKeyIncludes?: string[];
  addressKeyIncludes?: string[];
  contributionSubtypeKeyIncludes?: string[];
  assertOtherStringValues?: boolean;
  skipOtherIfKeyIncludes?: string[];
};

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};

export const getUrl = (url: string) => {
  const companyId = url.includes(config.COMPANY_ID) ? "LP123456" : "";
  const submissionId =
    url.includes(config.SUBMISSION_ID) ? appDevDependencies.limitedPartnershipGateway.submissionId : "";
  const generalPartnerId =
    url.includes(config.GENERAL_PARTNER_ID) ? appDevDependencies.generalPartnerGateway.generalPartnerId : "";
  const limitedPartnerId =
    url.includes(config.LIMITED_PARTNER_ID) ? appDevDependencies.limitedPartnerGateway.limitedPartnerId : "";
  const personWithSignificantControlId =
    url.includes(config.PERSON_WITH_SIGNIFICANT_CONTROL_ID) ?
      appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId
      : "";
  const appointmentId = url.includes(config.APPOINTMENT_ID) ? "AP123456" : "";

  const ids = {
    companyId,
    transactionId: appDevDependencies.transactionGateway.transactionId,
    submissionId,
    generalPartnerId,
    limitedPartnerId,
    personWithSignificantControlId,
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
    partner =
      isPerson ? new LimitedPartnerBuilder().isPerson().build() : new LimitedPartnerBuilder().isLegalEntity().build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([partner]);
    return { limitedPartner: partner, generalPartner: undefined };
  } else {
    partner =
      isPerson ? new GeneralPartnerBuilder().isPerson().build() : new GeneralPartnerBuilder().isLegalEntity().build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);
    return { limitedPartner: undefined, generalPartner: partner };
  }
};

export const expectPartnerData = (
  res: request.Response,
  partner: LimitedPartner | GeneralPartner,
  isPerson: boolean
) => {
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

export const expectErrorSummaryAndInlineError = (
  html: string,
  field: string,
  message: string
) => {
  expect(html).toContain(`<a href="#${field}">${message}</a>`);
  expect(html).toContain(`id="${field}-error"`);
  expect(countOccurrences(html, message)).toBeGreaterThanOrEqual(2);
};

export const expectChangeLinks = (text: string, changeLink: string[]) => {
  changeLink.forEach((link) => {
    expect(text).toContain(getUrl(link));
  });
};

export const createPersonWithSignificantControl = (url: string, urlToCompare: string) => {
  const personWithSignificantControl = new PersonWithSignificantControlBuilder().withId(
    appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId
  );

  if (url === urlToCompare) {
    personWithSignificantControl.isRelevantLegalEntity();
  } else {
    personWithSignificantControl.isOtherRegistrablePerson();
  }

  appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
    personWithSignificantControl.build()
  ]);
  return personWithSignificantControl;
};

const includesAnyPattern = (key: string, patterns: string[] = []): boolean => {
  return patterns.some((pattern) => key.includes(pattern));
};

const titleCaseWords = (value: string): string => {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const checkPartnerValuesInText = (
  res: request.Response,
  partner: LimitedPartner | GeneralPartner,
  translationText: Record<string, any>,
  options: CheckPartnerValuesInTextOptions = {}
) => {
  const partnerData = partner.data as Record<string, any>;

  for (const key in partnerData) {
    const value = partnerData[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== "string" && typeof value !== "object") {
      continue;
    }

    if (options.capitalizeKeys?.includes(key) && typeof value === "string") {
      expect(res.text).toContain(value.charAt(0).toUpperCase() + value.slice(1).toLowerCase());
      continue;
    }

    if (includesAnyPattern(key, options.dateKeyIncludes) && value) {
      expect(res.text).toContain(formatDate(value, translationText));
      continue;
    }

    if (includesAnyPattern(key, options.addressKeyIncludes) && typeof value === "object" && value.address_line_1) {
      expect(res.text).toContain(titleCaseWords(value.address_line_1));
      continue;
    }

    if (includesAnyPattern(key, options.contributionSubtypeKeyIncludes) && Array.isArray(value)) {
      const capitalContributionSubTypesMap: Record<string, string> = {
        MONEY: translationText.capitalContribution.money,
        LAND_OR_PROPERTY: translationText.capitalContribution.landOrProperty,
        SHARES: translationText.capitalContribution.shares,
        SERVICES_OR_GOODS: translationText.capitalContribution.servicesOrGoods,
        ANY_OTHER_ASSET: translationText.capitalContribution.anyOtherAsset
      };

      const str = value.map((word: string) => capitalContributionSubTypesMap[word]).join(" / ");
      expect(res.text).toContain(str.split("_").join(" "));
      continue;
    }

    if (
      options.assertOtherStringValues &&
      typeof value === "string" &&
      !includesAnyPattern(key, options.skipOtherIfKeyIncludes)
    ) {
      expect(res.text).toContain(value);
    }
  }
};

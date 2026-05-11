import request from "supertest";
import { Request, Response } from "express";
import { NameEndingType, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../locales/cy/translations.json";
import enErrorsTranslationText from "../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../locales/cy/errors.json";
import app from "../app";
import { EMAIL_URL, NAME_URL, NAME_WITH_IDS_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  REGISTRATION_BASE_URL,
  SERVICE_NAME_REGISTRATION
} from "../../../../config/constants";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../utils";

describe("Name Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyErrorsTranslationText };
  const REDIRECT_URL = getUrl(EMAIL_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Name Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the name page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: PartnershipType.LP
      });

      const res = await request(app).get(NAME_URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${translationText.namePage.title} - ${translationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, translationText.namePage, ["privateFund", "scottish"]);
      expect(res.text).toContain(translationText.buttons.saveAndContinue);
    });

    it("should load the name page with data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withNameEnding(NameEndingType.LIMITED_PARTNERSHIP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const URL = getUrl(NAME_WITH_IDS_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name);
      expect(res.text).toContain(limitedPartnership?.data?.name_ending);
    });

    it.each([
      ["English", "en", enTranslationText.namePage.privateFund, PartnershipType.PFLP, ],
      ["Welsh", "cy", cyTranslationText.namePage.privateFund, PartnershipType.PFLP, ],
      ["English", "en", enTranslationText.namePage.scottish, PartnershipType.SLP, ],
      ["Welsh", "cy", cyTranslationText.namePage.scottish, PartnershipType.SLP, ],
      ["English", "en", enTranslationText.namePage.privateFund.scottish, PartnershipType.SPFLP, ],
      ["Welsh", "cy", cyTranslationText.namePage.privateFund.scottish, PartnershipType.SPFLP, ]
    ])("should load the name page with %s text for %s partnership type", async (
      _description: string,
      lang: string,
      partnershipTypeTranslation: Record<string, any>,
      partnershipType: PartnershipType
    ) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: partnershipType
      });

      const res = await request(app).get(NAME_URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${partnershipTypeTranslation.title} - ${translationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, partnershipTypeTranslation, ["scottish", "nameEnding"]);
      expect(res.text).toContain(translationText.buttons.saveAndContinue);
      expect(res.text).toContain(toEscapedHtml(translationText.namePage.whatIsNameHint));
    });

    it("should load the name page with ids in back link url when name page has ids in url", async () => {
      const URL = getUrl(NAME_WITH_IDS_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      const regex = new RegExp(`${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/partnership-type`);
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Name Page", () => {
    it("should create a transaction and the first submission", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: PartnershipType.LP
      });

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);

      const res = await request(app).post(NAME_URL).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {}
      });
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);

      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(SERVICE_NAME_REGISTRATION);
    });

    it("should update the submission if already exist", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withNameEnding(NameEndingType.LIMITED_PARTNERSHIP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);

      const URL = getUrl(NAME_WITH_IDS_URL);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return validation errors if partnership name + name ending length exceeds limit in %s", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).post(NAME_URL + `?lang=${lang}`).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: "a".repeat(157),
        name_ending: NameEndingType.LIMITED_PARTNERSHIP
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.name.nameLength);
    });

    it("should not return validation errors when partnership name + name ending length is exactly at the limit", async () => {
      const res = await request(app).post(NAME_URL).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: "a".repeat(157),
        name_ending: NameEndingType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return validation errors if partnership name contains invalid characters in %s", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).post(NAME_URL + `?lang=${lang}`).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: "partnership_name",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.name.nameInvalid);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return validation errors if partnership name is empty or name ending is missing in %s", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).post(NAME_URL + `?lang=${lang}`).send({
        pageType: RegistrationPageType.partnershipName,
        partnership_name: ""
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.name.nameRequired);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.name.nameEndingRequired);
    });

    it("should return a status 500 if page type doesn't exist - sq", async () => {
      const res = await request(app).post(NAME_URL).send({
        pageType: "wrong-page-type"
      });

      expect(res.status).toBe(500);
    });

    it("should call next if type in path is incorrect - sq", async () => {
      const next = jest.fn();

      await appDevDependencies.globalController.getPageRouting()(
        {
          path: "/limited-partnerships/wrong-type"
        } as Request,
        {} as Response,
        next
      );

      expect(next).toHaveBeenCalled();
    });
  });
});

import request from "supertest";
import { Request, Response } from "express";
import { NameEndingType, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
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
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Name Page", () => {
  const REDIRECT_URL = getUrl(EMAIL_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Name Page", () => {
    it("should load the name page with Welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.LP
      });

      const res = await request(app).get(NAME_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.namePage.title} - ${cyTranslationText.service} - GOV.UK`);
      testTranslations(res.text, cyTranslationText.namePage, ["privateFund", "scottish"]);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the name page with English text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.LP
      });

      const res = await request(app).get(NAME_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.namePage.title} - ${enTranslationText.service} - GOV.UK`);
      testTranslations(res.text, enTranslationText.namePage, ["privateFund", "scottish"]);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
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

    it("should load the private name page with Welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.PFLP
      });

      const res = await request(app).get(NAME_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.namePage.privateFund.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.namePage.privateFund, ["scottish"]);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the private name page with English text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.PFLP
      });

      const res = await request(app).get(NAME_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.namePage.privateFund.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.namePage.privateFund, ["scottish"]);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the Scottish limited partnership name page with Welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.SLP
      });

      const res = await request(app).get(NAME_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.namePage.scottish.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.namePage.scottish);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the Scottish limited partnership name page with English text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.SLP
      });

      const res = await request(app).get(NAME_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.namePage.scottish.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.namePage.scottish);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the private name Scotland page with Welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.SPFLP
      });

      const res = await request(app).get(NAME_URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.namePage.privateFund.scottish);
      expect(res.text).toContain(cyTranslationText.namePage.whatIsNameHint);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the private name Scotland page with English text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.SPFLP
      });

      const res = await request(app).get(NAME_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.namePage.privateFund.scottish.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.namePage.privateFund.scottish);
      expect(res.text).toContain(enTranslationText.namePage.whatIsNameHint);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the name page with ids in back link url when name page has ids in url", async () => {
      const URL = getUrl(NAME_WITH_IDS_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      const regex = new RegExp(`${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/which-type`);
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Name Page", () => {
    it("should load the name page with status 200", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.LP
      });

      const res = await request(app).get(NAME_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("What is the limited partnership name?");
    });

    it("should create a transaction and the first submission", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]: PartnershipType.LP
      });

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);

      const res = await request(app).post(NAME_URL).send({
        pageType: RegistrationPageType.name,
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
        pageType: RegistrationPageType.name,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
    });

    it("should return validation errors", async () => {
      const res = await request(app).post(NAME_URL).send({
        pageType: RegistrationPageType.name
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("partnership_name must be less than 160");
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

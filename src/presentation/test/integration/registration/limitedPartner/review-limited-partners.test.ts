import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import RegistrationPageType from "../../../../controller/registration/PageType";

describe("Review Limited Partners Page", () => {
  const URL = getUrl(REVIEW_LIMITED_PARTNERS_URL);

  const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
  const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);
  });

  describe("Get Review Limited Partners Page", () => {
    it("should load the review limited partners page with English text", async () => {
      const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
      const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.reviewLimitedPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.reviewLimitedPartnersPage, ["emptyList"]);

      expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
      expect(res.text).toContain(`${limitedPartnerLegalEntity?.data?.legal_entity_name}`);
      expect(res.text).toContain(
        `You must provide all information for ${limitedPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });

    it("should load the review limited partners page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${cyTranslationText.reviewLimitedPartnersPage.title} - ${cyTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, cyTranslationText.reviewLimitedPartnersPage, ["emptyList", "errorMessage"]);

      expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
      expect(res.text).toContain(`${limitedPartnerLegalEntity?.data?.legal_entity_name}`);
    });

    describe("Empty list", () => {
      it("should redirect to limited partners start page when list is empty", async () => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

        const res = await request(app).get(URL);

        const redirectUrl = getUrl(LIMITED_PARTNERS_URL);
        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });
    });
  });

  describe("Post Review Limited Partners Page", () => {
    it("should redirect to the Add Limited Partner Person", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "addPerson"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(ADD_LIMITED_PARTNER_PERSON_URL));
    });

    it("should redirect to the Add Limited Partner Legal Entity", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "addLegalEntity"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL));
    });

    it("should redirect to the limited partners page", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "no"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(CHECK_YOUR_ANSWERS_URL));
    });

    it("should reload the page if no limited partner", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "no"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.reviewLimitedPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
      );
    });

    it("should render the review limited partners page with errors", async () => {
      const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
      const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "no"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `You must provide all information for ${limitedPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });

    it("should render the review limited partners page when trying to add a new person if any partner data is incomplete", async () => {
      const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
      const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "addPerson"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `You must provide all information for ${limitedPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });

    it("should render the review limited partners page when trying to add a new legal entity if any partner data is incomplete", async () => {
      const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
      const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewLimitedPartners,
        addAnotherLimitedPartner: "addLegalEntity"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `You must provide all information for ${limitedPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });
  });
});

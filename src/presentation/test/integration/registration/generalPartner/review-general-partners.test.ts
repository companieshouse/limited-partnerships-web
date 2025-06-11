import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import RegistrationPageType from "../../../../controller/registration/PageType";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

describe("Review General Partners Page", () => {
  const URL = getUrl(REVIEW_GENERAL_PARTNERS_URL);

  const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
  const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("Get Review General Partners Page", () => {
    it("should load the review general partners page with English text", async () => {
      const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
      const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.reviewGeneralPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.reviewGeneralPartnersPage, ["emptyList"]);

      expect(res.text).toContain(`${generalPartnerPerson?.data?.forename} ${generalPartnerPerson?.data?.surname}`);
      expect(res.text).toContain(`${generalPartnerLegalEntity?.data?.legal_entity_name}`);
      expect(res.text).toContain(
        `You must provide all information for ${generalPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });

    it("should load the review general partners page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${cyTranslationText.reviewGeneralPartnersPage.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.reviewGeneralPartnersPage, ["emptyList", "errorMessage"]);
    });

    describe("Empty list", () => {
      it("should redirect to general partners start page when list is empty", async () => {
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

        const res = await request(app).get(URL);

        const redirectUrl = getUrl(GENERAL_PARTNERS_URL);
        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });
    });
  });

  describe("Post Review General Partners Page", () => {
    it("should redirect to the Add General Partner Person", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewGeneralPartners,
        addAnotherGeneralPartner: "addPerson"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(ADD_GENERAL_PARTNER_PERSON_URL));
    });

    it("should redirect to the Add General Partner Legal Entity", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewGeneralPartners,
        addAnotherGeneralPartner: "addLegalEntity"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL));
    });

    describe("Selecting no more general partners", () => {
      it("should redirect to the limited partners page - no LPs", async () => {
        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.reviewGeneralPartners,
          addAnotherGeneralPartner: "no"
        });

        expect(res.status).toBe(302);
        expect(res.headers.location).toContain(getUrl(LIMITED_PARTNERS_URL));
      });

      it("should redirect to the review limited partners page - LPs", async () => {
        const limitedPartner = new LimitedPartnerBuilder().isPerson().build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.reviewGeneralPartners,
          addAnotherGeneralPartner: "no"
        });

        expect(res.status).toBe(302);
        expect(res.headers.location).toContain(getUrl(REVIEW_LIMITED_PARTNERS_URL));
      });

      it("should render the review general partners page with errors", async () => {
        const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
        const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.reviewGeneralPartners,
          addAnotherGeneralPartner: "no"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `You must provide all information for ${generalPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
        );
      });

      it("should render the review general partners page when trying to add a new partner person if any partner data is incomplete", async () => {
        const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
        const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.reviewGeneralPartners,
          addAnotherGeneralPartner: "addPerson"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `You must provide all information for ${generalPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
        );
      });

      it("should render the review general partners page when trying to add a new partner legal entity if any partner data is incomplete", async () => {
        const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
        const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.reviewGeneralPartners,
          addAnotherGeneralPartner: "addLegalEntity"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `You must provide all information for ${generalPartnerLegalEntity?.data?.legal_entity_name} before continuing. Select Change to provide more information`
        );
      });
    });
  });
});

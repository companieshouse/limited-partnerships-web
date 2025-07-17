import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import TransitionPageType from "../../../../controller/transition/PageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/transition/url";
import {
  GENERAL_PARTNER_CHOICE_TEMPLATE,
  REVIEW_GENERAL_PARTNERS_TEMPLATE
} from "../../../../controller/transition/template";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";
import { TRANSITION_BASE_URL } from "../../../../../config/constants";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();
  });

  describe("Get Add General Partner Legal Entity Page", () => {
    it("should load the add general partner legal entity page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerLegalEntityPage.generalPartner.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerLegalEntityPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, enTranslationText.generalPartnersPage, ["title", "pageInformation", "disqualificationStatement", "disqualificationStatementLegend"]);
    });

    it("should load the add general partner legal entity page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerLegalEntityPage.generalPartner.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerLegalEntityPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, enTranslationText.generalPartnersPage, ["title", "pageInformation", "disqualificationStatement", "disqualificationStatementLegend"]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`
      );
    });

    it("should contain a back link to the review page when general partners are present", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);

      const regex = new RegExp(
        `${TRANSITION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_GENERAL_PARTNERS_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${TRANSITION_BASE_URL}/transaction/.*?/submission/.*?/${GENERAL_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add General Partner Legal Entity", () => {
    it("should send the general partner legal entity details", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addGeneralPartnerLegalEntity,
        legal_entity_name: "test"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "Legal entity name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addGeneralPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
    });

    it("should send the general partner details and go to confirm ura address page if already saved", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: TransitionPageType.addGeneralPartnerLegalEntity,
          ...generalPartner.data
        });

      const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});

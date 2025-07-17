import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/registration/url";
import { TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";
import {
  GENERAL_PARTNER_CHOICE_TEMPLATE,
  REVIEW_GENERAL_PARTNERS_TEMPLATE
} from "../../../../controller/registration/template";
import { REGISTRATION_BASE_URL } from "../../../../../config/constants";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get Add General Partner Legal Entity Page", () => {
    it("should load the add general partner legal entity page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerLegalEntityPage.generalPartner.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerLegalEntityPage, [
        "limitedPartner",
        "errorMessages",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);
      expect(res.text).toContain("WELSH - I confirm that the general partner is not disqualified under the directors disqualification legislation, as defined in the Limited Partnership Act 1907.");
    });

    it("should load the add general partner legal entity page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerLegalEntityPage.generalPartner.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerLegalEntityPage, [
        "limitedPartner",
        "errorMessages",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);
      expect(res.text).toContain("I confirm that the general partner is not disqualified under the directors disqualification legislation, as defined in the Limited Partnership Act 1907.");
      expect(res.text).not.toContain("WELSH -");
    });

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
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
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_GENERAL_PARTNERS_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${GENERAL_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add General Partner Legal Entity", () => {
    it("should send the general partner legal entity details", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
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
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
    });
  });
});

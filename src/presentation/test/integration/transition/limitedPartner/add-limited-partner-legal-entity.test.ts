import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { TRANSITION_WITH_IDS_URL } from "config";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/transition/url";
import { TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/transition";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransitionPageType from "../../../../controller/transition/PageType";

describe("Add Limited Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
  });

  describe("Get Add Limited Partner Page", () => {
    it("should load the add limited partner page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addOrUpdatePartnerLegalEntityPage.limitedPartner.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addOrUpdatePartnerLegalEntityPage, [
        "errorMessages",
        "generalPartner",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);
    });

    it("should load the add limited partner page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addOrUpdatePartnerLegalEntityPage.limitedPartner.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addOrUpdatePartnerLegalEntityPage, [
        "errorMessages",
        "generalPartner",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);
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

    it("should retrieve limited partner data from the api", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("My Company ltd");
    });

    it("should contain a back link to the review page when limited partners are present", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);

      const BACK_LINK = `${getUrl(TRANSITION_WITH_IDS_URL)}/${TransitionPageType.reviewLimitedPartners}`;

      const regex = new RegExp(BACK_LINK);
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);

      const BACK_LINK = `${getUrl(TRANSITION_WITH_IDS_URL)}/${TransitionPageType.limitedPartnerType}`;
      const regex = new RegExp(BACK_LINK);
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add Limited Partner", () => {
    it("should send the Limited partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        forename: "test"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        forename: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS-FORENAME",
        legal_form: "Limited Company",
        governing_law: "Act of law",
        legal_entity_register_name: "US Register",
        legal_entity_transition_location: "United States",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("Limited Company");
      expect(res.text).toContain("United States");
    });
  });

  describe("Patch Add Limited Partner", () => {
    it("should send the limited partner details", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        forename: "test"
      });

      expect(res.status).toBe(302);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        forename: "INVALID-CHARACTERS"
      });
      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS-FORENAME",
        legal_form: "Limited Company",
        governing_law: "Act of law",
        legal_entity_register_name: "US Register",
        legal_entity_transition_location: "United States",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("Limited Company");
      expect(res.text).toContain("United States");
    });
  });
});

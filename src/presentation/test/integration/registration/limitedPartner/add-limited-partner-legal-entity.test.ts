import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/registration/url";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import RegistrationPageType from "../../../../controller/registration/PageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url";

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
        `${cyTranslationText.addPartnerLegalEntityPage.limitedPartner.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerLegalEntityPage, ["errorMessages", "generalPartner"]);
    });

    it("should load the add limited partner page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerLegalEntityPage.limitedPartner.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerLegalEntityPage, ["errorMessages", "generalPartner"]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${limitedPartnership?.data?.partnership_name?.toUpperCase()}`);
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
  });

  describe("Post Add Limited Partner", () => {
    it("should send the Limited partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
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
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
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
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS-FORENAME",
        legal_form: "Limited Company",
        governing_law: "Act of law",
        legal_entity_register_name: "US Register",
        legal_entity_registration_location: "United States",
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
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
        forename: "test"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
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
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
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
        pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS-FORENAME",
        legal_form: "Limited Company",
        governing_law: "Act of law",
        legal_entity_register_name: "US Register",
        legal_entity_registration_location: "United States",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("Limited Company");
      expect(res.text).toContain("United States");
    });
  });
});

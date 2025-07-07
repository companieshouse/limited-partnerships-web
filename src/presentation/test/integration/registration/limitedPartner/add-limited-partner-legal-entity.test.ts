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
import { TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";
import { REGISTRATION_BASE_URL } from "../../../../../config";
import {
  LIMITED_PARTNER_CHOICE_TEMPLATE,
  REVIEW_LIMITED_PARTNERS_TEMPLATE
} from "../../../../../presentation/controller/registration/template";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

describe("Add Limited Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
  });

  describe("Get Add Limited Partner Page", () => {
    it.each([
      ["for type LP", PartnershipType.LP, true],
      ["for type SLP", PartnershipType.SLP, true],
      ["for type PFLP", PartnershipType.PFLP, false],
      ["for type SPFLP", PartnershipType.SPFLP, false]
    ])(
      "should load the add limited partner legal entity page %s with Welsh text",
      async (_description, partnershipType, isCapitalContributionPresent) => {
        setLocalesEnabled(true);

        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${cyTranslationText.addPartnerLegalEntityPage.limitedPartner.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
        );
        testTranslations(res.text, cyTranslationText.addPartnerLegalEntityPage, [
          "errorMessages",
          "generalPartner",
          "dateEffectiveFrom",
          "dateHint",
          "dateDay",
          "dateMonth",
          "dateYear"
        ]);

        if (!isCapitalContributionPresent) {
          expect(res.text).not.toContain(cyTranslationText.capitalContribution.title);
        }
      }
    );

    it.each([
      ["for type LP", PartnershipType.LP, true],
      ["for type SLP", PartnershipType.SLP, true],
      ["for type PFLP", PartnershipType.PFLP, false],
      ["for type SPFLP", PartnershipType.SPFLP, false]
    ])(
      "should load the add limited partner legal entity page %s with English text",
      async (_desciption, partnershipType, isCapitalContributionPresent) => {
        setLocalesEnabled(true);

        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${enTranslationText.addPartnerLegalEntityPage.limitedPartner.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
        );
        testTranslations(res.text, enTranslationText.addPartnerLegalEntityPage, [
          "errorMessages",
          "generalPartner",
          "dateEffectiveFrom",
          "dateHint",
          "dateDay",
          "dateMonth",
          "dateYear"
        ]);
        expect(res.text).not.toContain("WELSH -");

        if (!isCapitalContributionPresent) {
          expect(res.text).not.toContain(enTranslationText.capitalContribution.title);
        }
      }
    );

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

    it("should contain a back link to the review page when limited partners are present", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_LIMITED_PARTNERS_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${LIMITED_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
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
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

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
        registered_company_number: "12345678",
        contribution_currency_value: "11111",
        contribution_currency_type: "EUR",
        contribution_sub_types: "SHARES",
        partnershipType: PartnershipType.LP
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("Limited Company");
      expect(res.text).toContain("United States");
      expect(res.text).toContain("11111");
      expect(res.text).toContain("EUR");
      expect(res.text).toContain("SHARES");
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

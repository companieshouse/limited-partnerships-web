import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enErrorsText from "../../../../../../locales/en/errors.json";
import cyErrorsText from "../../../../../../locales/cy/errors.json";
import app from "../../app";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { REGISTRATION_BASE_URL } from "../../../../../config";
import {
  LIMITED_PARTNER_CHOICE_TEMPLATE,
  REVIEW_LIMITED_PARTNERS_TEMPLATE
} from "../../../../../presentation/controller/registration/template";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

describe("Add Limited Partner Person Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

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
      "should load the add limited partner page with Welsh text for %s",
      async (description, partnershipType, isCapitalContributionPresent) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        setLocalesEnabled(true);
        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${cyTranslationText.addPartnerPersonPage.limitedPartner.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
        );
        testTranslations(res.text, cyTranslationText.addPartnerPersonPage, [
          "errorMessages",
          "generalPartner",
          "dateEffectiveFrom"
        ]);

        if (!isCapitalContributionPresent) {
          expect(res.text).not.toContain(cyTranslationText.capitalContribution.title);
        }
        expect(res.text).toContain(customerFeedbackUrlMap.registration);
      }
    );

    it.each([
      ["for type LP", PartnershipType.LP, true],
      ["for type SLP", PartnershipType.SLP, true],
      ["for type PFLP", PartnershipType.PFLP, false],
      ["for type SPFLP", PartnershipType.SPFLP, false]
    ])(
      "should load the add limited partner page with English text %s",
      async (_desciption, partnershipType, isCapitalContributionPresent) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        setLocalesEnabled(true);
        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${enTranslationText.addPartnerPersonPage.limitedPartner.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
        );
        testTranslations(res.text, enTranslationText.addPartnerPersonPage, [
          "errorMessages",
          "generalPartner",
          "dateEffectiveFrom"
        ]);
        expect(res.text).not.toContain("WELSH -");

        if (!isCapitalContributionPresent) {
          expect(res.text).not.toContain(enTranslationText.capitalContribution.title);
        }
        expect(res.text).toContain(customerFeedbackUrlMap.registration);
      }
    );

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
    });

    it("should retrieve limited partner data from the api", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe");
      expect(res.text).toContain("Doe");
    });

    it("should contain a back link to the review page when limited partners are present", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_LIMITED_PARTNERS_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_PERSON_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${LIMITED_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add Limited Partner", () => {
    it.each([
      ["true", "john"],
      ["false", ""]
    ])("should send the Limited partner details", async (previousName, formerNames) => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        partnershipType: PartnershipType.LP,
        forename: "test",
        previous_name: previousName,
        former_names: formerNames,
        surname: "surname",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        contribution_currency_type: "GBP",
        contribution_currency_value: "100.00",
        contribution_sub_types: ["MONEY"]
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME§§",
        surname: "SURNAME",
        former_names: "",
        previous_name: "false",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        contribution_currency_type: "GBP",
        contribution_currency_value: "100.00",
        contribution_sub_types: ["MONEY"]
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME§§");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previous_name-2" name="previous_name" type="radio" value="false" checked');
      expect(res.text).toContain("Mongolian");
      expect(res.text).toContain("Uzbek");
      expect(res.text).toContain("01");
      expect(res.text).toContain("11");
      expect(res.text).toContain("1987");
      expect(res.text).toContain("100.00");
      expect(res.text).toContain('"GBP" selected');
      expect(res.text).toContain('"MONEY" checked');
    });

    it("should show localised capital contribution errors when the section is left blank for an LP (LP-1473)", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      setLocalesEnabled(true);

      const res = await request(app)
        .post(URL + "?lang=cy")
        .send({
          pageType: RegistrationPageType.addLimitedPartnerPerson,
          partnershipType: PartnershipType.LP,
          forename: "test"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(cyErrorsText.errorMessages.capitalContribution.currencyRequired);
      expect(res.text).toContain(cyErrorsText.errorMessages.capitalContribution.valueRequired);
      expect(res.text).toContain(cyErrorsText.errorMessages.capitalContribution.atLeastOneType);
    });

    it("should not require capital contribution when the section is not shown (PFLP)", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.PFLP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        partnershipType: PartnershipType.PFLP,
        forename: "test",
        previous_name: "false",
        former_names: "",
        surname: "surname",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it.each(["", "   ", undefined])(
      "should show error message if previous names is Yes but no previous name entered",
      async (formerNames: string | undefined) => {
        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.addLimitedPartnerPerson,
          forename: "forename",
          surname: "SURNAME",
          former_names: formerNames,
          previous_name: "true",
          "date_of_birth-Day": "01",
          "date_of_birth-Month": "11",
          "date_of_birth-Year": "1987",
          nationality1: "Mongolian",
          nationality2: "Uzbek"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
        expect(res.text).toContain(toEscapedHtml("Enter the partner's previous name"));
      }
    );
  });

  describe("Patch from Add Limited Partner", () => {
    it("should send the limited partner details", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "test",
        previous_name: "false",
        former_names: "",
        surname: "surname",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        contribution_currency_type: "GBP",
        contribution_currency_value: "100.00",
        contribution_sub_types: ["MONEY"]
      });

      expect(res.status).toBe(302);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS§§"
      });
      expect(res.status).toBe(200);
      expect(res.text).toContain("First name must only include letters a to z, numbers and common special characters such as hyphens, spaces and apostrophes");
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME",
        surname: "SURNAME",
        former_names: "FORMER-NAMES",
        previous_name: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain("Mongolian");
      expect(res.text).toContain("Uzbek");
    });
  });

  describe("Validation", () => {
    it("should return validation errors when no data is submitted", async () => {

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        partnershipType: PartnershipType.LP
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enErrorsText.errorMessages.partners.addPartner.firstNameMissing));
      expect(res.text).toContain(toEscapedHtml(enErrorsText.errorMessages.partners.addPartner.lastNameMissing));
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.previousNameNotSelected);
      expect(res.text).toContain(toEscapedHtml(enErrorsText.errorMessages.partners.addPartner.dateOfBirthMissing));
      expect(res.text).toContain(toEscapedHtml(enErrorsText.errorMessages.partners.addPartner.nationality1Missing));
      expect(res.text).toContain(enErrorsText.errorMessages.capitalContribution.currencyRequired);
      expect(res.text).toContain(enErrorsText.errorMessages.capitalContribution.valueRequired);
      expect(res.text).toContain(enErrorsText.errorMessages.capitalContribution.atLeastOneType);
      expect(res.text).not.toContain(enErrorsText.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner);
    });

    it("should return validation error if first name has invalid characters", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS§§"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.firstNameInvalid);
    });

    it("should return validation error if first name is too long", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "A".repeat(256)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.firstNameTooLong);
    });

    it("should return validation error if last name has invalid characters", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        surname: "INVALID-CHARACTERS§§"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.lastNameInvalid);
    });

    it("should return validation error if last name is too long", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        surname: "A".repeat(256)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.lastNameTooLong);
    });

    it("should return validation error if former names missing", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        previous_name: "true",
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enErrorsText.errorMessages.partners.addPartner.formerNamesMissing));
    });

    it("should return validation error if former names has invalid characters", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        previous_name: "true",
        former_names: "INVALID-CHARACTERS§§"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.formerNamesInvalid);
    });

    it("should return validation error if former names is too long", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        previous_name: "true",
        former_names: "A".repeat(256)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.formerNamesTooLong);
    });

    it("should return validation error if nationality2 is same as nationality1", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        nationality1: "British",
        nationality2: "British"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorsText.errorMessages.partners.addPartner.nationality2Same);
    });
  });
});

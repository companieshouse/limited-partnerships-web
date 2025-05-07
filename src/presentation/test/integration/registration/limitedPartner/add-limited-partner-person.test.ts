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
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url";
import {
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
      ["for type LP", PartnershipType.LP],
      ["for type SLP", PartnershipType.SLP]
    ])("should load the add limited partner page with Welsh text for %s", async (_desciption, partnershipType) => {

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(partnershipType)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerPersonPage.limitedPartner.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerPersonPage, ["errorMessages", "generalPartner"]);
      testTranslations(res.text, cyTranslationText.capitalContribution, ["compositionErrorMessage"]);
    });

    it.each([
      ["for type LP", PartnershipType.LP],
      ["for type SLP", PartnershipType.SLP]
    ])("should load the add limited partner page with English text %s", async (_desciption, partnershipType) => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(partnershipType)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerPersonPage.limitedPartner.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerPersonPage, ["errorMessages", "generalPartner"]);
      testTranslations(res.text, enTranslationText.capitalContribution, ["compositionErrorMessage"]);
      expect(res.text).not.toContain("WELSH -");
    });

    it.each([
      ["for type PFLP", PartnershipType.PFLP],
      ["for type SPFLP", PartnershipType.SPFLP]
    ])("should load the add limited partner page with Welsh text %s", async (_desciption, partnershipType) => {

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(partnershipType)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerPersonPage.limitedPartner.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerPersonPage, ["errorMessages", "generalPartner"]);
      expect(res.text).not.toContain(cyTranslationText.capitalContribution.title);
    });

    it.each([
      ["for type PFLP", PartnershipType.PFLP],
      ["for type SPFLP", PartnershipType.SPFLP]
    ])("should load the add limited partner page with English text %s", async (_desciption, partnershipType) => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(partnershipType)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerPersonPage.limitedPartner.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerPersonPage, ["errorMessages", "generalPartner"]);
      expect(res.text).not.toContain(enTranslationText.capitalContribution.title);
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
  });

  describe("Post Add Limited Partner", () => {
    it("should send the Limited partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
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
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
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
        former_names: "",
        previousName: "false",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameNo" name="previousName" type="radio" value="false" checked');
      expect(res.text).toContain("Mongolian");
      expect(res.text).toContain("Uzbek");
    });
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
        forename: "test"
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

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });
      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
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
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain("Mongolian");
      expect(res.text).toContain("Uzbek");
    });
  });
});

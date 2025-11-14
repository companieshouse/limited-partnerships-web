import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { TRANSITION_WITH_IDS_URL } from "config";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransitionPageType from "../../../../controller/transition/PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/transition/url";
import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/transition";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

describe("Add Limited Partner Person Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
  });

  describe("Get Add Limited Partner Page", () => {
    it("should load the add limited partner page with Welsh text", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerPersonPage.limitedPartner.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerPersonPage, [
        "errorMessages",
        "generalPartner",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);

      expect(res.text).not.toContain(enTranslationText.capitalContribution.title);
    });

    it("should load the add limited partner page with English text", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerPersonPage.limitedPartner.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerPersonPage, [
        "errorMessages",
        "generalPartner",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).not.toContain(enTranslationText.capitalContribution.title);
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

      const BACK_LINK = `${getUrl(TRANSITION_WITH_IDS_URL)}/${TransitionPageType.reviewLimitedPartners}`;

      const regex = new RegExp(`${BACK_LINK}`);
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);

      const BACK_LINK = `${getUrl(TRANSITION_WITH_IDS_URL)}/${TransitionPageType.limitedPartnerChoice}`;

      const regex = new RegExp(`${BACK_LINK}`);
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add Limited Partner", () => {
    it("should send the Limited partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerPerson,
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
        pageType: TransitionPageType.addLimitedPartnerPerson,
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
        pageType: TransitionPageType.addLimitedPartnerPerson,
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

    it("should show error message if previous names is Yes but no previous name entered", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.addLimitedPartnerPerson,
        forename: "forename",
        surname: "SURNAME",
        former_names: "",
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("Enter the previous name(s) of the limited partner");
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
        pageType: TransitionPageType.addLimitedPartnerPerson,
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
        pageType: TransitionPageType.addLimitedPartnerPerson,
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
        pageType: TransitionPageType.addLimitedPartnerPerson,
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

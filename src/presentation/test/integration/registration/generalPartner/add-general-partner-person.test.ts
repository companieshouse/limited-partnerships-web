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
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import { POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

describe("Add General Partner Person Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_URL);
  const REDIRECT_URL = getUrl(POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();
  });

  describe("Get Add General Partner Page", () => {
    it("should load the add general partner page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addGeneralPartnerPersonPage.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addGeneralPartnerPersonPage, ["errorMessages"]);
    });

    it("should load the add general partner page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addGeneralPartnerPersonPage.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addGeneralPartnerPersonPage, ["errorMessages"]);
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
  });

  describe("Post Add General Partner", () => {
    it("should send the general partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        first_name: "test"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { first_name: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        first_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("general partner name is invalid");
    });
  });

  describe("Patch from Add General Partner", () => {
    it("should send the general partner details", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        first_name: "test"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const apiErrors: ApiErrors = {
        errors: { first_name: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        first_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("general partner name is invalid");
    });
  });
});

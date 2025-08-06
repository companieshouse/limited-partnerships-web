import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { EMAIL_URL } from "../../../controller/transition/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import {
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../controller/addressLookUp/url/transition";
import { JOURNEY_TYPE_PARAM } from "../../../../config/constants";
import { Journey } from "../../../../domain/entities/journey";

describe("Email Page", () => {
  const URL = getUrl(EMAIL_URL);
  const REDIRECT_URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Get /email", () => {
    describe("English", () => {
      it("should load the name page with English text", async () => {
        setLocalesEnabled(true);
        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.emailPage, ["registration"]);
        expect(res.text).toContain(
          `${enTranslationText.emailPage.title} - ${enTranslationText.serviceTransition} - GOV.UK`
        );
        expect(res.text).not.toContain("WELSH -");
      });
    });

    describe("Welsh", () => {
      it("should load the email page with Welsh text", async () => {
        setLocalesEnabled(true);
        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${cyTranslationText.emailPage.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
        );
        testTranslations(res.text, cyTranslationText.emailPage, ["registration"]);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });
    });

    describe("replay previously entered data", () => {
      it("should load the email page with data from api - transition", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder().build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(limitedPartnership?.data?.email);
        expect(res.text).toContain(
          `${limitedPartnership?.data?.partnership_name?.toUpperCase()} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`
        );
      });
    });
  });

  describe("Post email", () => {
    it("should send email", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@example.com"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should redirect to the CONFIRM_REGISTERED_OFFICE_ADDRESS_URL page if the registered office address is already saved", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@example.com"
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL).replace(
        JOURNEY_TYPE_PARAM,
        Journey.transition
      );

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const apiErrors: ApiErrors = {
        errors: { "data.email": "must be a well-formed email address" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@example."
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must be a well-formed email address");
    });
  });
});

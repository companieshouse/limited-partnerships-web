import request from "supertest";
import enGeneralTranslationText from "../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../locales/cy/translations.json";
import enErrorsTranslationText from "../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../locales/cy/errors.json";
import app from "../app";
import { EMAIL_URL, WHERE_IS_THE_JURISDICTION_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url/registration";

describe("Email Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyErrorsTranslationText };

  const URL = getUrl(EMAIL_URL);
  const REDIRECT_URL = getUrl(WHERE_IS_THE_JURISDICTION_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
  });

  describe("Get Email Page", () => {
    it("should load the name page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.emailPage, ["transition"]);
      expect(res.text).toContain(
        `${enTranslationText.emailPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the email page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.emailPage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.emailPage, ["transition"]);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the email page with data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
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

    it("should redirect to the page CONFIRM_REGISTERED_OFFICE_ADDRESS_URL if the registered office address is already saved", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@example.com"
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return a validation error if email is empty in %s", async (_description, lang, translationText) => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL + `?lang=${lang}`).send({
        pageType: RegistrationPageType.email,
        email: ""
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.email.emailRequired);
      expect(res.text).toContain('href="#email"');
      expect(res.text).toContain(translationText.govUk.error.title);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return a validation error if email is not in the correct format in %s", async (_description, lang, translationText) => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL + `?lang=${lang}`).send({
        pageType: RegistrationPageType.email,
        email: "test@example."
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.limitedPartnership.email.emailInvalid);
    });

    it("should replay the invalid email the user submitted when validation fails", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@example."
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('value="test@example."');
    });

    it("should render an api validation error when the format passes web validation", async () => {
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
        email: "test@example.com"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must be a well-formed email address");
    });
  });
});

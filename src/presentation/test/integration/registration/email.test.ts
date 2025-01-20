import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { EMAIL_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { setLocalesEnabled } from "../../../../test/test-utils";

describe("Email Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Get Email Page", () => {
    it("should load the name page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(EMAIL_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.emailPage.whatIsEmail} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
      expect(res.text).toContain(enTranslationText.emailPage.emailHint);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the name page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(EMAIL_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.emailPage.whatIsEmail} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(cyTranslationText.emailPage.whatIsEmail);
      expect(res.text).toContain(cyTranslationText.emailPage.emailHint);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the name page with data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const res = await request(app).get(EMAIL_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
      );
    });
  });

  describe("Post email", () => {
    it("should send email", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.transactionGateway.transactionId,
        appDevDependencies.limitedPartnershipGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: RegistrationPageType.email,
        email: "test@example.com"
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/postcode-registered-office-address`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return a validation error", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const apiErrors: ApiErrors = {
        errors: { "data.email": "must be a well-formed email address" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.transactionGateway.transactionId,
        appDevDependencies.limitedPartnershipGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: RegistrationPageType.email,
        email: "test@example."
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must be a well-formed email address");
    });
  });
});

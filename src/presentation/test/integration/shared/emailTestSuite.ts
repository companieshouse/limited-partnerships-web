import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { setLocalesEnabled, testTranslations } from "../../utils";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

export interface EmailTestConfig {
  emailUrl: string;
  pageType: string;
  defaultRedirectUrl: string;
  confirmAddressRedirectUrl: string;
  serviceTitleTranslationKey: string;
  translateExclude: string[];
  getPartnershipDisplay: (lp: any) => string;
}

export function runEmailTests(config: EmailTestConfig): void {
  const {
    emailUrl,
    pageType,
    defaultRedirectUrl,
    confirmAddressRedirectUrl,
    serviceTitleTranslationKey,
    translateExclude,
    getPartnershipDisplay
  } = config;

  describe("Email Page", () => {
    beforeEach(() => {
      setLocalesEnabled(false);
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
      appDevDependencies.limitedPartnershipGateway.feedErrors();
    });

    describe("Get email page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the email page with %s text", async (_language, lang, translationText) => {
        setLocalesEnabled(true);
        const res = await request(app).get(emailUrl + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(res.text, translationText.partnership.emailPage, translateExclude);
        expect(res.text).toContain(
          `${translationText.partnership.emailPage.title} - ${translationText[serviceTitleTranslationKey]} - GOV.UK`
        );
        if (lang === "en") {
          expect(res.text).not.toContain("WELSH -");
        } else {
          expect(res.text).toContain("WELSH -");
        }
      });

      it("should load the email page with data from api", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder().build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(emailUrl);

        expect(res.status).toBe(200);
        expect(res.text).toContain(limitedPartnership?.data?.email);
        expect(res.text).toContain(getPartnershipDisplay(limitedPartnership));
      });
    });

    describe("Post email", () => {
      it.each([
        {
          description: "redirect to the next page",
          nullifyAddress: true,
          expectedRedirect: defaultRedirectUrl
        },
        {
          description: "redirect to the confirm registered office address page if the registered office address is already saved",
          nullifyAddress: false,
          expectedRedirect: confirmAddressRedirectUrl
        }
      ])("should $description", async ({ nullifyAddress, expectedRedirect }) => {
        const builder = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId);

        if (nullifyAddress) {
          builder.withRegisteredOfficeAddress(null);
        }

        const limitedPartnership = builder.build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(emailUrl).send({
          pageType,
          email: "test@example.com"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${expectedRedirect}`);
      });

      it.each([
        ["English", "en", enTranslationText, "", "emailRequired"],
        ["Welsh", "cy", cyTranslationText, "", "emailRequired"],
        ["English", "en", enTranslationText, "test@example.", "emailInvalid"],
        ["Welsh", "cy", cyTranslationText, "test@example.", "emailInvalid"]
      ])("should return a validation error if email is not in the correct format in %s", async (_description, lang, translationText: Record<string, any>, email, errorType) => {
        setLocalesEnabled(true);

        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(emailUrl + `?lang=${lang}`).send({
          pageType,
          email: email
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.errorMessages.limitedPartnership.email[errorType]);
        expect(res.text).toContain('href="#email"');
        expect(res.text).toContain(translationText.govUk.error.title);
      });

      it("should replay the invalid email the user submitted when validation fails", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(emailUrl).send({
          pageType,
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

        const res = await request(app).post(emailUrl).send({
          pageType,
          email: "test@example.com"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("must be a well-formed email address");
      });
    });
  });
}

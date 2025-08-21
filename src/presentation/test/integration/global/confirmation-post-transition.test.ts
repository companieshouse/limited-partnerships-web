import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { CONFIRMATION_POST_TRANSITION_URL } from "../../../controller/global/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import { GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL, LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../controller/postTransition/url";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";

describe("Confirmation Page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL).replace(JOURNEY_TYPE_PARAM, Journey.postTransition);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET /confirmation", () => {
    describe("General Partner", () => {
      describe("English", () => {
        it("should load confirmation page - general partner (person)", async () => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const res = await request(app).get(URL).set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - GP");
          expect(res.text).toContain("Doe - GP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, ["limitedPartnerType"]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        });

        it("should load confirmation page - general partner (legal entity)", async () => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const res = await request(app).get(URL).set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - GP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, ["limitedPartnerType"]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        });
      });
    });

    describe("Welsh", () => {
      it("should load confirmation page - general partner (person)", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(URL + "?lang=cy").set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("Joe - GP");
        expect(res.text).toContain("Doe - GP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, ["limitedPartnerType"]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
      });

      it("should load confirmation page - general partner (legal entity)", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .build();
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(URL + "?lang=cy").set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("My Company ltd - GP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, ["limitedPartnerType"]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
      });
    });

    describe("Limited Partner", () => {
      describe("English", () => {
        it("should load confirmation page - limited partner (person)", async () => {
          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isPerson()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const res = await request(app).get(URL).set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - LP");
          expect(res.text).toContain("Doe - LP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, ["generalPartnerType"]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        });

        it("should load confirmation page - limited partner (legal entity)", async () => {
          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const res = await request(app).get(URL).set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - LP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, ["generalPartnerType"]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        });
      });
    });

    describe("Welsh", () => {
      it("should load confirmation page - limited partner (person)", async () => {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const res = await request(app).get(URL + "?lang=cy").set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("Joe - LP");
        expect(res.text).toContain("Doe - LP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, ["generalPartnerType"]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
      });

      it("should load confirmation page - limited partner (legal entity)", async () => {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const res = await request(app).get(URL + "?lang=cy").set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("My Company ltd - LP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, ["generalPartnerType"]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
      });
    });
  });
});

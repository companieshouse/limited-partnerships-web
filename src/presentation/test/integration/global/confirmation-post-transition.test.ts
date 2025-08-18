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

describe("Confirmation Page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL).replace(JOURNEY_TYPE_PARAM, Journey.postTransition);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET /confirmation", () => {
    describe("English", () => {
      it("should load confirmation page - general partner (person)", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("Joe - GP");
        expect(res.text).toContain("Doe - GP");
        testTranslations(res.text, enTranslationText.confirmationPage.postTransition.generalPartner);
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

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("My Company ltd - GP");
        testTranslations(res.text, enTranslationText.confirmationPage.postTransition.generalPartner);
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

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain("test@email.com");
      expect(res.text).toContain("Joe - GP");
      expect(res.text).toContain("Doe - GP");
      testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.generalPartner);
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

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain("test@email.com");
      expect(res.text).toContain("My Company ltd - GP");
      testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.generalPartner);
      expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
      expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
      expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
    });
  });
});

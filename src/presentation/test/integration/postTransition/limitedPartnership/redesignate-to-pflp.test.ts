import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { REDESIGNATE_TO_PFLP_URL } from "presentation/controller/postTransition/url";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "presentation/controller/postTransition/pageType";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP } from "config";
import LimitedPartnershipBuilder from "presentation/test/builder/LimitedPartnershipBuilder";
import { ApiErrors } from "domain/entities/UIErrors";

describe("Redesignate to pflp page", () => {
  const URL = getUrl(REDESIGNATE_TO_PFLP_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";
  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.limitedPartnershipGateway.setError(false);
  });

  describe("GET page", () => {
    it("should load the page with English text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.redesignateToPflpPage);
      expect(res.text).toContain(
        `${enTranslationText.redesignateToPflpPage.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the page with Welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.redesignateToPflpPage.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.redesignateToPflpPage);
    });
  });

  describe("POST page", () => {
    it("should create a transaction, send data and navigate to payment", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.redesignateToPflp,
        redesignate_to_pflp_apply: true,
        redesignate_to_pflp_confirm: true,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP);
    });

    it("should return a validation error if api validation error occurs creating LimitedPartnership", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      const apiErrors: ApiErrors = {
        errors: { something: "Something is invalid" }
      };
      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain("Something is invalid");
    });

    it("should throw error when payment redirect url is missing", async () => {
      appDevDependencies.paymentGateway.feedPaymentWithEmptyJourney();
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.redesignateToPflp
      });

      expect(res.status).toBe(500);
      expect(res.text).not.toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });
  });
});

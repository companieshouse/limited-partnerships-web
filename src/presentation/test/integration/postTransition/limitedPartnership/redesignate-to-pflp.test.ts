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

describe("Redesignate to pflp page", () => {
  const URL = getUrl(REDESIGNATE_TO_PFLP_URL);
  const REDIRECT_URL = "https://api-test-payments.chs.local:4001";
  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
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
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP);
    });
  });
});

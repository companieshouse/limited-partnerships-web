import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { REDESIGNATE_TO_PFLP_URL } from "../../../../controller/postTransition/url";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { TRANSACTION_DESCRIPTION_DESIGNATE_AS_PRIVATE_FUND_PARTNERSHIP, YOUR_COMPANY_URL } from "../../../../../config/index";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
describe("Redesignate to pflp page", () => {
  const URL = getUrl(REDESIGNATE_TO_PFLP_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";
  const BACK_LINK = getUrl(YOUR_COMPANY_URL);

  let companyProfile: any;

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
      testTranslations(res.text, enTranslationText.partnership.redesignateToPflpPage, ["cost"]);
      expect(res.text).toContain(
        `${enTranslationText.partnership.redesignateToPflpPage.title} - ${enTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(countOccurrences(res.text, enTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP)).toBe(2);
      expect(res.text).toContain(enTranslationText.partnership.redesignateToPflpPage.cost.replace("{{ cost }}", process.env.COST_LP8D_REDESIGNATE_TO_PFLP as string));
      expect(res.text).toContain(customerFeedbackUrlMap.updateLimitedPartnershipRedesignateToPFLP);
      expect(res.text).toContain(BACK_LINK);

      expect(res.text).toContain(enTranslationText.buttons.continue);
    });

    it("should load the page with Welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.partnership.redesignateToPflpPage.title} - ${cyTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.partnership.redesignateToPflpPage, ["cost"]);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP)).toBe(2);
      expect(res.text).toContain(cyTranslationText.partnership.redesignateToPflpPage.cost.replace("{{ cost }}", process.env.COST_LP8D_REDESIGNATE_TO_PFLP as string));
      expect(res.text).toContain(customerFeedbackUrlMap.updateLimitedPartnershipRedesignateToPFLP);
      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("POST page", () => {
    it("should create a transaction for designate to private funds, send data and navigate to payment", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.redesignateToPflp,
        redesignate_to_pflp_apply: true,
        redesignate_to_pflp_confirm: true,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(TRANSACTION_DESCRIPTION_DESIGNATE_AS_PRIVATE_FUND_PARTNERSHIP);
    });

    it("should throw error when payment redirect url is missing", async () => {
      appDevDependencies.paymentGateway.feedPaymentWithEmptyJourney();
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.redesignateToPflp,
        redesignate_to_pflp_apply: true,
        redesignate_to_pflp_confirm: true,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(500);
      expect(res.text).not.toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });

    it.each([
      ["both checkboxes", false, false, enTranslationText.errorMessages.redesignateToPflpPage.bothRequired],
      ["the apply checkbox", false, true, enTranslationText.errorMessages.redesignateToPflpPage.applyRequired],
      ["the confirm checkbox", true, false, enTranslationText.errorMessages.redesignateToPflpPage.confirmationRequired]
    ])(
      "should render the page with errors if the user does not select %s",
      async (_description: string, redesignate_to_pflp_apply: boolean, redesignate_to_pflp_confirm: boolean, errorMessage: string) => {
        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.redesignateToPflp,
          redesignate_to_pflp_apply,
          redesignate_to_pflp_confirm,
          partnership_type: PartnershipType.LP
        });

        expect(res.status).toBe(200);
        expect(countOccurrences(res.text, errorMessage)).toBe(2);
      }
    );
  });

  describe("should render the error page", () => {
    it(`should render to error page if ${PartnershipType.PFLP}`, async () => {

      companyProfile.data.subtype = "private-fund-limited-partnership";

      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it(`should render the error page if ${PartnershipType.SPFLP}`, async () => {
      companyProfile.data.jurisdiction = Jurisdiction.SCOTLAND;
      companyProfile.data.subtype = "private-fund-limited-partnership";

      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});

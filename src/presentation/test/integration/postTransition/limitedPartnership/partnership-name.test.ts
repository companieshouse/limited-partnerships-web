import request from "supertest";
import app from "../../app";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { PARTNERSHIP_NAME_URL, WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL } from "../../../../../presentation/controller/postTransition/url";
import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import { Jurisdiction, NameEndingType, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import { TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP } from "../../../../../config";

describe("Name Page", () => {
  const URL = getUrl(PARTNERSHIP_NAME_URL);
  const REDIRECT_URL = getUrl(WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL);
  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.limitedPartnershipGateway.setError(false);
  });

  describe("Get Name Page", () => {

    it.each([
      [PartnershipType.LP, cyTranslationText.namePage, ["privateFund", "scottish"]],
      [PartnershipType.PFLP, cyTranslationText.namePage.privateFund, ["scottish", "nameEnding"]],
      [PartnershipType.SLP, cyTranslationText.namePage.scottish, []],
      [PartnershipType.SPFLP, cyTranslationText.namePage.privateFund.scottish, []]
    ])("should load the name page with Welsh text", async (partnershipType: PartnershipType, expected, exclude) => {
      setLocalesEnabled(true);

      if (partnershipType === PartnershipType.SLP || partnershipType === PartnershipType.SPFLP) {
        companyProfile.data.jurisdiction = Jurisdiction.SCOTLAND;
      }

      if (partnershipType === PartnershipType.PFLP || partnershipType === PartnershipType.SPFLP) {
        companyProfile.data.subtype = "private-fund-limited-partnership";
      }

      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.updateLimitedPartnershipName)).toBe(2);
      expect(res.text).toContain(`${expected.title} - ${cyTranslationText.serviceName.updateLimitedPartnershipName} - GOV.UK`);
      testTranslations(res.text, expected, exclude);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it.each([
      [PartnershipType.LP, enTranslationText.namePage, ["privateFund", "scottish"]],
      [PartnershipType.PFLP, enTranslationText.namePage.privateFund, ["scottish", "nameEnding"]],
      [PartnershipType.SLP, enTranslationText.namePage.scottish, []],
      [PartnershipType.SPFLP, enTranslationText.namePage.privateFund.scottish, []]
    ])("should load the name page with English text", async (partnershipType: PartnershipType, expected, exclude) => {
      setLocalesEnabled(true);

      if (partnershipType === PartnershipType.SLP || partnershipType === PartnershipType.SPFLP) {
        companyProfile.data.jurisdiction = Jurisdiction.SCOTLAND;
      }

      if (partnershipType === PartnershipType.PFLP || partnershipType === PartnershipType.SPFLP) {
        companyProfile.data.subtype = "private-fund-limited-partnership";
      }

      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, enTranslationText.serviceName.updateLimitedPartnershipName)).toBe(2);
      expect(res.text).toContain(`${expected.title} - ${enTranslationText.serviceName.updateLimitedPartnershipName} - GOV.UK`);
      testTranslations(res.text, expected, exclude);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the name page with data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipName("TEST LP")
        .withNameEnding(NameEndingType.LIMITED_PARTNERSHIP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(limitedPartnership?.data?.partnership_name);
    });
  });

  describe("Post Name Page", () => {

    it("should create a transaction and the first submission", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.partnershipName,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: PartnershipType.LP
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP);
    });

    it("should return validation errors", async () => {
      const res = await request(app).post(PARTNERSHIP_NAME_URL).send({
        pageType: PostTransitionPageType.partnershipName,
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("partnership_name must be less than 160");
    });
  });
});

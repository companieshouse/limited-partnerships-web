import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "presentation/controller/transition/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { APPLICATION_CACHE_KEY_COMPANY_NUMBER, SERVICE_NAME_TRANSITION } from "../../../../config";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm correct limited partnership page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);
  let companyProfile;

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.companyGateway.setError(false);

    appDevDependencies.cacheRepository.feedCache({
      [APPLICATION_CACHE_KEY_COMPANY_NUMBER]: companyProfile.data.companyNumber
    });
  });

  describe("Get confirm limited partnership page", () => {
    it("should load confirm correct limited partnership page with english text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${enTranslationText.confirmLimitedPartnership.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain("TEST LP");
      expect(res.text).toContain("LP123456");
    });

    it("should load confirm correct limited partnership page with welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.companyGateway.companyProfile.dateOfCreation = "2019-01-11";

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${cyTranslationText.confirmLimitedPartnership.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain("TEST LP");
      expect(res.text).toContain("LP123456");
    });

    it("should return an error if company_number is not valid", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("The partnership cannot be found");
    });
  });

  describe("Post confirm limited partnership page", () => {
    it.each([
      {
        description: "LP - england-wales",
        jurisdiction: Jurisdiction.ENGLAND_AND_WALES,
        subtype: false,
        partnershipType: PartnershipType.LP
      },
      {
        description: "PFLP - england-wales",
        jurisdiction: Jurisdiction.ENGLAND_AND_WALES,
        subtype: true,
        partnershipType: PartnershipType.PFLP
      },
      {
        description: "LP - northern-ireland",
        jurisdiction: Jurisdiction.NORTHERN_IRELAND,
        subtype: false,
        partnershipType: PartnershipType.LP
      },
      {
        description: "PFLP - northern-ireland",
        jurisdiction: Jurisdiction.NORTHERN_IRELAND,
        subtype: true,
        partnershipType: PartnershipType.PFLP
      },
      {
        description: "SLP - scotland",
        jurisdiction: Jurisdiction.SCOTLAND,
        subtype: false,
        partnershipType: PartnershipType.SLP
      },
      {
        description: "PFSLP - scotland",
        jurisdiction: Jurisdiction.SCOTLAND,
        subtype: true,
        partnershipType: PartnershipType.SPFLP
      }
    ])(`should create a transaction and a $description`, async ({ jurisdiction, subtype, partnershipType }) => {
      const companyProfile = new CompanyProfileBuilder().withJurisdiction(jurisdiction);
      if (subtype) {
        companyProfile.withSubtype();
      }
      companyProfile.build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);

      const res = await request(app).post(URL);

      expect(res.status).toBe(302);
      // expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships?.[0]?.data?.partnership_number).toEqual(
        companyProfile.data.companyNumber
      );
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships?.[0]?.data?.partnership_name).toEqual(
        companyProfile.data.companyName
      );
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships?.[0]?.data?.partnership_type).toEqual(
        partnershipType
      );

      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(SERVICE_NAME_TRANSITION);
    });
  });
});

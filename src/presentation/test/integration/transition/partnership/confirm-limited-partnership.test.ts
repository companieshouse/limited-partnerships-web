import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

// Overrides the global mocks in setup-jest.ts so company authentication passes by default
// but can be switched to the real middleware (and real authMiddleware) per test
const mockCompanyAuth = { useReal: false };
jest.mock("../../../../../middlewares/company-authentication.middleware", () => {
  const actual = jest.requireActual("../../../../../middlewares/company-authentication.middleware");
  return {
    companyAuthentication: (req: Request, res: Response, next: NextFunction) =>
      mockCompanyAuth.useReal ? actual.companyAuthentication(req, res, next) : next()
  };
});
jest.mock("@companieshouse/web-security-node", () => ({
  ...jest.requireActual("@companieshouse/web-security-node"),
  CsrfProtectionMiddleware: (_opts: unknown) => (req: Request, res: Response, next: NextFunction) => next(),
  acspManageUsersAuthMiddleware: jest.fn(() => jest.fn((req: Request, res: Response, next: NextFunction) => next()))
}));

import app from "../../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { SERVICE_NAME_TRANSITION } from "../../../../../config";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { COMPANY_NUMBER_URL, CONFIRM_LIMITED_PARTNERSHIP_URL, EMAIL_URL } from "../../../../controller/transition/url";
import GlobalPageType from "../../../../controller/global/PageType";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
describe("Confirm correct limited partnership page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);
  let companyProfile;

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.companyGateway.setError(false);
  });

  describe("Get confirm limited partnership page", () => {
    it("should load confirm correct limited partnership page with english text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.companyGateway.companyProfile.dateOfCreation = "2019-01-11";

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.partnership.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${enTranslationText.partnership.confirmLimitedPartnership.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain("TEST LP");
      expect(res.text).toContain("LP123456");
      expect(res.text).toContain(`11 ${enTranslationText.months.january} 2019`);
      expect(res.text).toContain(enTranslationText.companyStatus.active);
      expect(res.text).toContain("4 Duncalf Street<br>Stroke-On-Trent<br>ST6 3LJ<br>England");
      expect(res.text).toContain(`href="${COMPANY_NUMBER_URL}?lang=en"`);
    });

    it("should load confirm correct limited partnership page with welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.companyGateway.companyProfile.dateOfCreation = "2019-01-11";

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.partnership.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${cyTranslationText.partnership.confirmLimitedPartnership.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain("TEST LP");
      expect(res.text).toContain("LP123456");
      expect(res.text).toContain(`11 ${cyTranslationText.months.january} 2019`);
    });

    it("should display the raw company status when there is no translation for it", async () => {
      appDevDependencies.companyGateway.companyProfile.companyStatus = "unknown-status";

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain("unknown-status");
    });

    it("should render page not found if the company cannot be found", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(404);
      expect(res.text).toContain(enTranslationText.pageNotFound.title);
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

      const REDIRECT_URL = getUrl(EMAIL_URL);

      const res = await request(app).post(URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

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

  describe("Company authentication", () => {
    beforeEach(() => {
      mockCompanyAuth.useReal = true;
    });

    afterEach(() => {
      mockCompanyAuth.useReal = false;
    });

    // If the GET is not protected, the page renders and the first "Save and continue" POST is
    // lost to the sign-in redirect, so the user has to press the button twice.
    it("should redirect to sign in before rendering the page when not authorised for the company", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(302);
      expect(res.header.location).toContain(`/signin?return_to=${URL}`);
    });

    it("should redirect to company not limited partnership page without asking for company authentication", async () => {
      const companyProfile = new CompanyProfileBuilder().withType("ltd").build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL);

      expect(res.status).toBe(302);
      expect(res.header.location).toContain(GlobalPageType.companyNotLimitedPartnership);
      expect(res.header.location).not.toContain("/signin");

      const notLpRes = await request(app).get(res.header.location);

      expect(notLpRes.status).toBe(200);
    });

    it("should redirect to sign in on post when not authorised for the company", async () => {
      const res = await request(app).post(URL);

      expect(res.status).toBe(302);
      expect(res.header.location).toContain(`/signin?return_to=${URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);
    });
  });
});

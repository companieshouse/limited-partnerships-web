import request from "supertest";
import app from "../app";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import { GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../controller/postTransition/url";
import { APPLICATION_CACHE_KEY_COMPANY_NUMBER } from "../../../../config/constants";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import { CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url/postTransition";

describe("Check Your Answers Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

  let companyProfile;
  let generalPartnerLegalEntity;

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.cacheRepository.feedCache({
      [APPLICATION_CACHE_KEY_COMPANY_NUMBER]: companyProfile.data.companyNumber
    });

    generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withDateEffectiveFrom("2024-10-10").build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerLegalEntity]);
  });

  describe("GET Check Your Answers Page", () => {
    it("should GET Check Your Answers Page English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage, [
        "lpInfo",
        "headingType",
        "change",
        "headingEmail",
        "headingJurisdiction",
        "headingRegisteredOfficeAddress",
        "submitFiling",
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "headingJurisdiction",
        "generalPartners",
        "limitedPartners",
        "person",
        "headingPrincipalPlaceOfBusinessAddress",
        "confirm",
        "futureLawful",
        "capitalContribution",
        "payment"
      ]);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("10 October 2024");
      expect(res.text).not.toContain("WELSH -");
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
        "lpInfo",
        "headingType",
        "change",
        "headingEmail",
        "headingJurisdiction",
        "headingRegisteredOfficeAddress",
        "submitFiling",
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "headingJurisdiction",
        "generalPartners",
        "limitedPartners",
        "person",
        "headingPrincipalPlaceOfBusinessAddress",
        "confirm",
        "futureLawful",
        "capitalContribution",
        "payment"
      ]);
      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("10 WELSH - October 2024");
      expect(res.text).toContain("WELSH -");
    });

    it.each([
      [URL + "?lang=en", "/limited-partnerships/sign-out?lang=en"],
      [URL + "?lang=cy", "/limited-partnerships/sign-out?lang=cy"],
      [URL, "/limited-partnerships/sign-out"]
    ])(
      "should set the signout link href correctly for url: %s",
      async (testUrl: string, expectedHref: string) => {
        setLocalesEnabled(true);
        const res = await request(app).get(testUrl);

        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedHref);
      }
    );

    it("Should contain a back link to the confirm principal office address page", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    });
  });
});


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
import { CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL } from "../../../controller/addressLookUp/url/postTransition";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { formatDate } from "../../../../utils/date-format";

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
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.title);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage.warningMessage);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.title);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage.warningMessage);
      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
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
      expect(res.text).not.toContain(getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL));
    });

    it("Should not contain back link to confirm principal office adddress page if not legal entity", async () => {
      const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().withDateEffectiveFrom("2024-10-10").build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    });

    it("should load the check your answers page with partners - EN", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

      testTranslations(res.text, enTranslationText.checkYourAnswersPage.partners, ["capitalContribution", "title", "changeRemoveOrAdd", "limitedPartners", "person"]);

      checkIfValuesInText(res, generalPartnerLegalEntity, enTranslationText);
    });

    it("should load the check your answers page with partners - CY", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

      testTranslations(res.text, cyTranslationText.checkYourAnswersPage.partners, ["capitalContribution", "title", "changeRemoveOrAdd", "limitedPartners", "person"]);

      checkIfValuesInText(res, generalPartnerLegalEntity, cyTranslationText);
    });
  });
});

const checkIfValuesInText = (res: request.Response, partner: GeneralPartner, translationText: Record<string, any>) => {
  for (const key in partner.data) {
    if (typeof partner.data[key] === "string" || typeof partner.data[key] === "object") {
      if (key === "principal_office_address") {
        const capitalized = partner.data[key].address_line_1
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_effective_from")) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else if (!key.includes("address")) {
        expect(res.text).toContain(partner.data[key]);
      }
    }
  }
};


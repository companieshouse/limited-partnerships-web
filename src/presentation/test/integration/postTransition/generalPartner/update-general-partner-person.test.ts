import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import { UPDATE_GENERAL_PARTNER_PERSON_URL } from "../../../../controller/postTransition/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

describe("Update General Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Update update general partner person page with English text", () => {
    it("should load the update general partner legal entity page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, enTranslationText.updatePartnerPersonPage, ["limitedPartner", "errorMessages"]);

      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the update general partner person page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, cyTranslationText.updatePartnerPersonPage, ["limitedPartner", "errorMessages"]);
    });

    it("should contain the proposed name - data from api", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
      );
    });
  });
});

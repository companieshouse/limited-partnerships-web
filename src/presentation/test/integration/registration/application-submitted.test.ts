import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  APPLICATION_SUBMITTED_URL
} from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Application Submitted Page", () => {
  const URL = getUrl(APPLICATION_SUBMITTED_URL);
  const surveyURL = "https://www.smartsurvey.co.uk/s/file-for-lp-conf/";

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Application Submitted Page", () => {
    it("should load the application submitted page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.applicationSubmittedPage);
      expect(res.text).toContain(surveyURL);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the application submitted page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.applicationSubmittedPage);
      expect(res.text).toContain(surveyURL);
    });

    it("should have the correct reference number", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
    });
  });
});

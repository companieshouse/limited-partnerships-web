import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../../utils";

import { PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import { PARTNERSHIP_NAME_TEMPLATE, WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_TEMPLATE } from "../../../../../../presentation/controller/postTransition/template";

describe("Partnership name check your answers page", () => {
  const URL = getUrl(PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET partnership name check your answers page", () => {
    it("should load partnership name check your answers page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${PARTNERSHIP_NAME_TEMPLATE}?lang=en`);
      expect(res.text).toContain(`${WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_TEMPLATE}?lang=en`);
    });

    it("should load partnership name check your answers page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${PARTNERSHIP_NAME_TEMPLATE}?lang=cy`);
      expect(res.text).toContain(`${WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_TEMPLATE}?lang=cy`);
    });
  });

  describe("POST partnership name check your answers page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.partnershipNameChangeCheckYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });
  });
});

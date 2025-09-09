import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../../utils";

import { REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Registered office address check your answers page", () => {
  const URL = getUrl(REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL);

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

  describe("GET registered office address check your answers page", () => {
    it("should load registered office address check your answers page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load registered office address check your answers page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("POST registered office address check your answers page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.registeredOfficeAddressChangeCheckYourAnswers
      });

      const redirectUrl = getUrl(CONFIRMATION_POST_TRANSITION_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});

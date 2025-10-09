import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { getUrl, setLocalesEnabled } from "../../../../../../presentation/test/utils";
import { PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL } from "../../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../../../presentation/controller/postTransition/pageType";
import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../../presentation/controller/global/url";
import { ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE, WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_TEMPLATE } from "../../../../../../presentation/controller/postTransition/template";

describe("Principal place of business address check your answers page", () => {
  const URL = getUrl(PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL);

  let partnership: LimitedPartnership;

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    partnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([partnership]);
  });

  describe("GET principal place of business address check your answers page", () => {
    it("should load principal place of business address check your answers page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}?lang=en`);
      expect(res.text).toContain(`${WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_TEMPLATE}?lang=en`);
    });

    it("should load principal place of business address check your answers page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}?lang=cy`);
      expect(res.text).toContain(`${WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_TEMPLATE}?lang=cy`);
    });
  });

  describe("POST place of business address check your answers page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.principalPlaceOfBusinessAddressChangeCheckYourAnswers
      });

      const redirectUrl = getUrl(CONFIRMATION_POST_TRANSITION_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});

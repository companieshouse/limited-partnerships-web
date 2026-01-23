import request from "supertest";
import { PartnershipKind, Term } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled } from "../../../../utils";

import { TERM_CHANGE_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import { TERM_TEMPLATE, WHEN_DID_TERM_CHANGE_TEMPLATE } from "../../../../../../presentation/controller/postTransition/template";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Term change check your answers page", () => {
  const URL = getUrl(TERM_CHANGE_CHECK_YOUR_ANSWERS_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withTerm(Term.BY_AGREEMENT)
      .build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const transaction = new TransactionBuilder().withKind(PartnershipKind.UPDATE_PARTNERSHIP_TERM).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET term change check your answers page", () => {
    it("should load term change check your answers page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(enTranslationText.termPage.byAgreement);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");
      expect(countOccurrences(res.text, enTranslationText.serviceName.updateLimitedPartnershipTerm)).toBe(2);

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${TERM_TEMPLATE}?lang=en`);
      expect(res.text).toContain(`${WHEN_DID_TERM_CHANGE_TEMPLATE}?lang=en`);
    });

    it("should load term change check your answers page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(cyTranslationText.termPage.byAgreement);
      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.updateLimitedPartnershipTerm)).toBe(2);

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${TERM_TEMPLATE}?lang=cy`);
      expect(res.text).toContain(`${WHEN_DID_TERM_CHANGE_TEMPLATE}?lang=cy`);
    });
  });

  describe("POST term change check your answers page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.termChangeCheckYourAnswers
      });

      const redirectUrl = getUrl(CONFIRMATION_POST_TRANSITION_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});

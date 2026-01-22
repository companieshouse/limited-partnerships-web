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
import {
  ENTER_REGISTERED_OFFICE_ADDRESSS_TEMPLATE,
  WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_TEMPLATE
} from "../../../../../../presentation/controller/postTransition/template";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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

    const transaction = new TransactionBuilder().withKind(PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
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

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${ENTER_REGISTERED_OFFICE_ADDRESSS_TEMPLATE}?lang=en`);
      expect(res.text).toContain(`${WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_TEMPLATE}?lang=en`);

      expect(res.text).toContain(enTranslationText.countries.england);
      const occurrences = res.text.split(enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress).length - 1;
      expect(occurrences).toBe(2);
    });

    it("should load registered office address check your answers page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${ENTER_REGISTERED_OFFICE_ADDRESSS_TEMPLATE}?lang=cy`);
      expect(res.text).toContain(`${WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_TEMPLATE}?lang=cy`);

      expect(res.text).toContain(cyTranslationText.countries.england);
      const occurrences = res.text.split(cyTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress).length - 1;
      expect(occurrences).toBe(2);
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

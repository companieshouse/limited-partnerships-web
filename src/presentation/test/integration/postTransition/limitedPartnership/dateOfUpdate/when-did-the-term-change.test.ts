import request from "supertest";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, toEscapedHtml } from "../../../../utils";

import {
  TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_TERM_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";
describe("Partnership term change date page", () => {
  const URL = getUrl(WHEN_DID_THE_TERM_CHANGE_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnershipKind.UPDATE_PARTNERSHIP_TERM).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET partnership term change date page", () => {
    it("should load partnership term change date page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.dateOfUpdate.term.title}`);
      expect(res.text).not.toContain("WELSH -");
      expect(countOccurrences(res.text, enTranslationText.serviceName.updateLimitedPartnershipTerm)).toBe(2);
    });

    it("should load partnership term change date page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.term.title}`);
      expect(res.text).toContain("WELSH -");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.updateLimitedPartnershipTerm)).toBe(2);
    });
  });

  describe("POST partnership term change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheTermChange,
        "date_of_update-day": "10",
        "date_of_update-month": "01",
        "date_of_update-year": "2020"
      });

      const REDIRECT_URL = getUrl(TERM_CHANGE_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });

  it("should display error message when the date is in the future", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.whenDidTheTermChange,
      "date_of_update-day": "10",
      "date_of_update-month": "01",
      "date_of_update-year": "2030"
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateOfUpdate.dateNotInPast.term));
  });

  it("should display error message when the date is missing", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.whenDidTheTermChange,
      "date_of_update-day": "",
      "date_of_update-month": "",
      "date_of_update-year": ""
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateOfUpdate.dateMissing.term));
  });
});

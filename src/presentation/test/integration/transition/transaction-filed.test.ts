import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";

import { CONFIRM_LIMITED_PARTNERSHIP_URL, TRANSITION_ALREADY_FILED_URL } from "../../../controller/transition/url";
import { NAME_URL } from "../../../controller/registration/url";

import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import FilingHistoryBuilder from "../../builder/FilingHistoryBuilder";

describe("Transition already filed", () => {
  const URL = getUrl(TRANSITION_ALREADY_FILED_URL);
  let companyProfile;

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it("should render TRANSITION_ALREADY_FILED_URL page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);

    expect(res.text).toContain(enTranslationText.transactionFiled.acceptedInformation);

    testTranslations(res.text, enTranslationText.transactionFiled, ['acceptedInformation']);
  });

  it("should render TRANSITION_ALREADY_FILED_URL with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    expect(res.text).toContain(cyTranslationText.transactionFiled.acceptedInformation);

    testTranslations(res.text, cyTranslationText.transactionFiled, ['acceptedInformation']);
  });

  it.each([{ form: "LPTS01" }, { form: "LP5D" }, { form: "LP7D" }])(
    `should redirect to transition-already-filed url - form $form`,
    async (data: { form: string }) => {
      const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

      const filingHistory = new FilingHistoryBuilder().withType(data.form).build();

      appDevDependencies.filingHistoryGateway.feedFilingHistoryItems([filingHistory]);

      const res = await request(app).get(URL + "?lang=cy");

      const REDIRECT_URL = getUrl(TRANSITION_ALREADY_FILED_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}?lang=cy`);
    }
  );

  it("should not redirect to transition-already-filed url if the form is LP6D", async () => {
    const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

    const filingHistory = new FilingHistoryBuilder().withType("LP6D").build();

    appDevDependencies.filingHistoryGateway.feedFilingHistoryItems([filingHistory]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.confirmLimitedPartnership.title);
    expect(countOccurrences(res.text, enTranslationText.confirmLimitedPartnership.title)).toBe(2);
  });

  it("should not redirect to transition-already-filed url if it is not transiton journey", async () => {
    const res = await request(app).get(NAME_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
  });
});

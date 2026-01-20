import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import app from "../app";

import { TRANSITION_ALREADY_FILED_URL } from "../../../controller/transition/url";

import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

describe("Test Transition already filed url is setup correctly", () => {
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

    testTranslations(res.text, enTranslationText.transactionFiled);
  });

  it("should render TRANSITION_ALREADY_FILED_URL with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    testTranslations(res.text, cyTranslationText.transactionFiled);
  });
});

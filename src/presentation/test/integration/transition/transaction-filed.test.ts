import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";

import { CONFIRM_LIMITED_PARTNERSHIP_URL, TRANSITION_ALREADY_FILED_URL } from "../../../controller/transition/url";
import { NAME_URL } from "../../../controller/registration/url";

import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
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

  it("should redirect to transition-already-filed url", async () => {
    const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

    // temporary query params to simulate existing filing check - will be replace by a call to filing service
    const res = await request(app).get(URL + "?formExists=true");

    const REDIRECT_URL = getUrl(TRANSITION_ALREADY_FILED_URL);

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
  });

  it("should not redirect to transition-already-filed url if it is not transiton journey", async () => {
    const res = await request(app).get(NAME_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
  });
});

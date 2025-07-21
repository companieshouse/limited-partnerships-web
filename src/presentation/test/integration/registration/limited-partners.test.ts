import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { LIMITED_PARTNERS_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";

describe("Limited Partners Page", () => {
  const URL = getUrl(LIMITED_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  it("should load the limited partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnersPage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.limitedPartnersPage);
  });

  it("should load the limited partners page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnersPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.limitedPartnersPage);
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
    );
  });

  it("should redirect to review page if list not empty", async () => {
    const limitedPartner = new LimitedPartnerBuilder().isPerson().build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    const res = await request(app).get(URL);

    const REDIRECT_URL = getUrl(REVIEW_LIMITED_PARTNERS_URL);

    expect(res.status).toBe(302);
    expect(res.text).toContain(REDIRECT_URL);
  });
});

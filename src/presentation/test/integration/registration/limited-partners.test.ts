import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { LIMITED_PARTNERS_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { setLocalesEnabled } from "../../../../test/test-utils";

describe("Limited Partners Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  it("should load the limited partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNERS_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnersPage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.limitedPartnersPage.title);
  });

  it("should load the limited partners page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNERS_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.limitedPartnersPage.title);
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const res = await request(app).get(LIMITED_PARTNERS_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
    );
  });
});

import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { TRANSITION_BASE_URL } from "../../../../../config/constants";

import { GENERAL_PARTNERS_URL } from "../../../../controller/transition/url";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("General Partners Page", () => {
  const URL = getUrl(GENERAL_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  it("should load the general partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnersPage.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.generalPartnersPage, [
      "disqualificationStatement",
      "disqualificationStatementLegend"
    ]);
  });

  it("should load the general partners page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnersPage.title} - ${enTranslationText.serviceTransition} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.generalPartnersPage, [
      "disqualificationStatement",
      "disqualificationStatementLegend"
    ]);
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`
    );
  });

  it("should contain the correct back link based on partnership type", async () => {
    setLocalesEnabled(true);
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    const regex = new RegExp(`${TRANSITION_BASE_URL}/transaction/.*?/submission/.*?/general-partner-choice`);
    expect(res.text).toMatch(regex);
  });
});

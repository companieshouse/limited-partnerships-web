import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  // ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/transition/url";
import TransitionPageType from "../../../../../presentation/controller/transition/PageType";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("General Partner Choice Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHOICE_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnerChoicePage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.generalPartnerChoicePage);
  });

  it("should load the general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnerChoicePage.title} - ${enTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.generalPartnerChoicePage);
  });

  it("should redirect to General Partner Person page when person is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: TransitionPageType.generalPartnerChoice,
      parameter: "person"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_PERSON_URL));
  });

  it.skip("should redirect to General Partner Legal Entity page when legal entity is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: TransitionPageType.generalPartnerChoice,
      parameter: "legalEntity"
    });

    expect(res.status).toBe(302);
    // expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL));
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
});

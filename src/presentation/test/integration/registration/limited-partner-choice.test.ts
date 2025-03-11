import request from "supertest";
import { APPLICATION_CACHE_KEY, APPLICATION_CACHE_KEY_PREFIX_REGISTRATION } from "../../../../config/constants";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { LIMITED_PARTNER_CHOICE_URL, CHECK_YOUR_ANSWERS_URL } from "../../../controller/registration/url";
import { registrationRoutingLimitedPartnerChoice } from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Limited Partner Choice Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHOICE_URL);
  const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${cyTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.limitedPartnerChoicePage);
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${enTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.limitedPartnerChoicePage);
  });

  it("should store the limited partner choice to cache", async () => {
    const selectedChoice = "person";

    const res = await request(app).post(URL).send({
      pageType: registrationRoutingLimitedPartnerChoice.pageType,
      parameter: selectedChoice,
    });

    expect(res.status).toBe(302);
    expect(res.header.location).toEqual(REDIRECT_URL);

    // to be removed - not store in cache
    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.limitedPartnerChoice}`]: selectedChoice,
      },
    });
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
});

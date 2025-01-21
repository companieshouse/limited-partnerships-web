import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  GENERAL_PARTNER_CHOICE_URL,
  LIMITED_PARTNERS_URL
} from "../../../controller/registration/url";
import RegistrationPageType from "../../../../presentation/controller/registration/PageType";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config/constants";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { setLocalesEnabled } from "../../../../test/test-utils";

describe("General Partner Choice Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNER_CHOICE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnerChoicePage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      cyTranslationText.generalPartnerChoicePage.title
    );
  });

  it("should load the general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNER_CHOICE_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnerChoicePage.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      enTranslationText.generalPartnerChoicePage.title
    );
  });

  it("should redirect to next page when choice is selected", async () => {
    const selectedType = "person";
    const res = await request(app).post(GENERAL_PARTNER_CHOICE_URL).send({
      pageType: RegistrationPageType.generalPartnerChoice,
      parameter: selectedType
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(LIMITED_PARTNERS_URL);

    // to be removed - not store in cache
    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.generalPartnerChoice}`]:
          selectedType
      }
    });
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const res = await request(app).get(GENERAL_PARTNER_CHOICE_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
    );
  });
});

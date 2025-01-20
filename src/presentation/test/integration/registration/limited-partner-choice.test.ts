import request from "supertest";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config/constants";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  LIMITED_PARTNER_CHOICE_URL,
  CHECK_YOUR_ANSWERS_URL
} from "../../../controller/registration/url";
import { registrationRoutingLimitedPartnerChoice } from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { setLocalesEnabled } from "../../../../test/test-utils";

describe("Limited Partner Choice Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity
    );
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity
    );
  });

  it("should store the limited partner choice to cache", async () => {
    const transactionId = "3664373";
    const submissionId = "1543454";
    const selectedChoice = "person";

    const url = appDevDependencies.registrationController.insertIdsInUrl(
      LIMITED_PARTNER_CHOICE_URL,
      transactionId,
      submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingLimitedPartnerChoice.pageType,
      parameter: selectedChoice
    });

    expect(res.status).toBe(302);
    const nextPageUrl =
      appDevDependencies.registrationController.insertIdsInUrl(
        CHECK_YOUR_ANSWERS_URL,
        transactionId,
        submissionId
      );
    expect(res.header.location).toEqual(nextPageUrl);

    // to be removed - not store in cache
    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.limitedPartnerChoice}`]:
          selectedChoice
      }
    });
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
    );
  });
});

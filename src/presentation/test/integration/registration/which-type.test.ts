import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import {
  NAME_URL,
  NAME_WITH_IDS_URL,
  PARTNERSHIP_TYPE_URL,
  PARTNERSHIP_TYPE_WITH_IDS_URL
} from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import RegistrationPageType from "../../../controller/registration/PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  SERVICE_NAME_REGISTRATION
} from "../../../../config/constants";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import LimitedPartnershipBuilder from "../../../../presentation/test/builder/LimitedPartnershipBuilder";

describe("Which type Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the partnership-type page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(PARTNERSHIP_TYPE_URL + "?lang=en");

    expect(res.status).toBe(200);
    testTranslations(res.text, enTranslationText.partnershipTypePage);
    testTranslations(res.text, enTranslationText.types);
    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).toContain(SERVICE_NAME_REGISTRATION);
  });

  it("should load the partnership-type page with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(PARTNERSHIP_TYPE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    testTranslations(res.text, cyTranslationText.partnershipTypePage);
    expect(res.text).toContain(cyTranslationText.buttons.continue);
    expect(res.text).toContain(SERVICE_NAME_REGISTRATION);
  });

  it("should redirect to name page and cache contains the type selected", async () => {
    const selectedType = PartnershipType.LP;

    const res = await request(app).post(PARTNERSHIP_TYPE_URL).send({
      pageType: RegistrationPageType.partnershipType,
      parameter: selectedType
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${NAME_URL}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: selectedType
      }
    });
  });

  it("should redirect to name page and update type in cache", async () => {
    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: PartnershipType.LP
    });

    const selectedType = PartnershipType.PFLP;

    const res = await request(app).post(PARTNERSHIP_TYPE_URL).send({
      pageType: RegistrationPageType.partnershipType,
      parameter: selectedType
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${NAME_URL}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`]: selectedType
      }
    });
  });

  it("should redirect to name page and retain ids in url if no change in type selected", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withPartnershipType(PartnershipType.PFLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(getUrl(PARTNERSHIP_TYPE_WITH_IDS_URL)).send({
      pageType: RegistrationPageType.partnershipType,
      parameter: PartnershipType.PFLP
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${getUrl(NAME_WITH_IDS_URL)}`);
  });

  it("should redirect to name page and remove ids in url if change in type selected", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withPartnershipType(PartnershipType.PFLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(getUrl(PARTNERSHIP_TYPE_WITH_IDS_URL)).send({
      pageType: RegistrationPageType.partnershipType,
      parameter: PartnershipType.LP
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${NAME_URL}`);
  });
});

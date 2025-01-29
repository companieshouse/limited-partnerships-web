import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import { NAME_URL, WHICH_TYPE_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import RegistrationPageType from "../../../../presentation/controller/registration/PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config/constants";
import { getUrl } from "../../utils";

describe("Which type Page", () => {
  const URL = getUrl(WHICH_TYPE_URL);
  const REDIRECT_URL = getUrl(NAME_URL);

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the which-type page", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.whichTypePage.title);
    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).toContain(enTranslationText.whichTypePage.options.LP);
  });

  it("should redirect to name page and cache contains the type selected", async () => {
    const selectedType = PartnershipType.LP;

    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.whichType,
      parameter: selectedType
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${getUrl(REDIRECT_URL)}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
          selectedType
      }
    });
  });

  it("should redirect to name page and update type in cache", async () => {
    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.LP
    });

    const selectedType = PartnershipType.PFLP;

    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.whichType,
      parameter: selectedType
    });

    const REDIRECT_URL = getUrl(NAME_URL);

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
          selectedType
      }
    });
  });
});

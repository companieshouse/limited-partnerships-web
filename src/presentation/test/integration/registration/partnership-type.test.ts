import request from "supertest";

import app from "../app";
import { NAME_URL, WHICH_TYPE_URL } from "../../../controller/registration/Routing";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import RegistrationPageType from "../../../../presentation/controller/registration/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../config/constants";

describe("Which type Page", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the which-type page", async () => {
    const res = await request(app).get(WHICH_TYPE_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.whichTypePage.title);
    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).toContain(
      enTranslationText.whichTypePage.options.LP
    );
  });

  it("should redirect to name page and contains the type selected", async () => {
    const selectedType = "registerLp";

    const res = await request(app).post(WHICH_TYPE_URL).send({
      pageType: RegistrationPageType.whichType,
      parameter: selectedType,
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${NAME_URL}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [RegistrationPageType.whichType]: selectedType
      }
    });
  });
});

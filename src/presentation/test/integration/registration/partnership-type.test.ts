import request from "supertest";

import app from "../app";
import { WHICH_TYPE_URL } from "../../../controller/registration/Routing";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";

describe("Which type Page", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should load the which-type page", async () => {
    const res = await request(app).get(WHICH_TYPE_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.whichTypePage.title);
    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).toContain(
      enTranslationText.whichTypePage.options.registerLp
    );
  });
});

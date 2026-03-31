import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL } from "../../../../controller/registration/url";

describe("Which type Page", () => {
  const URL = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
  });

  it.each([
    ["english", "en", enTranslationText],
    ["welsh", "cy", cyTranslationText]
  ])(
    "should load the psc choice page with %s text",
    async (description: string, lang: string, translationText: any) => {
      setLocalesEnabled(true);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      testTranslations(res.text, translationText.personWithSignificantControl.whichTypePage);

      expect(res.text).toContain(translationText.buttons.continue);
    }
  );
});

import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControl";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import {
  REMOVE_PERSON_WITH_SIGNIFICANT_CONTROL_URL,
  REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL
} from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";

describe("Remove Person With Significant Control Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };
  const URL = getUrl(REMOVE_PERSON_WITH_SIGNIFICANT_CONTROL_URL);

  const pscRle = new PersonWithSignificantControlBuilder()
    .isRelevantLegalEntity()
    .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
    .build();

  const pscOrp = new PersonWithSignificantControlBuilder()
    .isOtherRegistrablePerson()
    .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
    .build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
  });

  describe("Get Remove Person With Significant Control Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the remove PSC page with %s text",
      async (_description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRle]);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.removePscPage.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.removePscPage, ["errorMessage"]);

        expect(res.text).toContain(`${pscRle?.data?.legal_entity_name}`);
      }
    );

    it.each([
      ["RLE", pscRle],
      ["ORP", pscOrp]
    ])("should display the %s name in the page title", async (_description: string, psc) => {
      setLocalesEnabled(true);

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([psc]);

      const res = await request(app).get(`${URL}?lang=en`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${psc?.data?.legal_entity_name}`);
    });
  });

  describe("Post Remove Person With Significant Control Page", () => {
    it.each([
      ["yes", 0, "PSC removed"],
      ["no", 1, "PSC not removed"]
    ])(
      "should redirect to the review PSC page when remove is '%s' - %s",
      async (removeValue: string, expectedLength: number) => {
        setLocalesEnabled(true);

        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRle]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.removePersonWithSignificantControl,
          remove: removeValue
        });

        expect(res.status).toBe(302);
        expect(res.header.location).toBe(getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL));

        expect(
          appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl
        ).toHaveLength(expectedLength);
      }
    );

    it("should display validation error when no option selected", async () => {
      setLocalesEnabled(true);

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRle]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.removePersonWithSignificantControl
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        enTranslationText.personWithSignificantControl.removePscPage.errorMessage
      );
      expect(res.text).toContain(`${pscRle?.data?.legal_entity_name}`);
    });
  });
});

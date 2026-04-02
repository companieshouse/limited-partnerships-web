import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL } from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";

import RegistrationPageType from "../../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControl";

describe("Which Type of Nature of Control Page", () => {
  const URL = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL);
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
  });

  describe("Get Which Type of Nature of Control Page", () => {
    it.each([["en", enTranslationText], ["cy", cyTranslationText]])("should load the which type of nature of control page with %s text", async (lang: string, translationText: any) => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.personWithSignificantControl.whichTypeOfNatureOfControlPage.relevantLegalEntity.title} - ${translationText.serviceRegistration} - GOV.UK`
      );
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
      testTranslations(res.text, translationText.personWithSignificantControl.whichTypeOfNatureOfControlPage.relevantLegalEntity);
    });
  });

  describe("Post Which Type of Nature of Control Page", () => {
    it("should redirect to the territory choice principal office address page", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);

      const res = await request(app).post(URL)
        .send({
          pageType: RegistrationPageType.whichTypeOfNatureOfControlRelevantLegalEntity
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});

import request from "supertest";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import RegistrationPageType from "../../../../controller/registration/PageType";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  DOES_INDIVIDUAL_PERSON_REQUIRE_PROTECTION_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL
} from "../../../../controller/registration/url";
import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
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

      testTranslations(res.text, translationText.personWithSignificantControl.whichTypePage, ["errorMessage"]);
      testTranslations(res.text, translationText.personWithSignificantControl.relevantLegalEntityAndOtherRegistrablePersonInformation);

      expect(res.text).toContain(translationText.buttons.continue);

      const BACK_LINK = getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL);
      expect(res.text).toContain(BACK_LINK);
    }
  );

  it.each([
    [
      "add individual person",
      PersonWithSignificantControlType.INDIVIDUAL_PERSON,
      DOES_INDIVIDUAL_PERSON_REQUIRE_PROTECTION_URL
    ],
    [
      "add relevant legal entity",
      PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
      ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL
    ],
    [
      "add other registrable person",
      PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON,
      ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL
    ]
  ])(
    "should redirect to the %s page when %s option is selected",
    async (description: string, parameter: string, url: string) => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.personWithSignificantControlChoice,
        parameter
      });

      expect(res.status).toBe(302);

      const REDIRECT_URL = getUrl(url);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    }
  );

  it("should re-render the page if no option is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.personWithSignificantControlChoice,
      parameter: ""
    });

    expect(res.status).toBe(200);

    expect(res.text).toContain(enTranslationText.personWithSignificantControl.whichTypePage.errorMessage);
  });
});

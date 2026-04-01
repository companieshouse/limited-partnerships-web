import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlText from "../../../../../../locales/cy/personWithSignificantControl.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL
} from "../../../../controller/registration/url";

import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControl";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("Add Person With Significant Control Other registrable person Page", () => {
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL);
  const enTranslation = Object.assign(enTranslationText, enPersonWithSignificantControlText);
  const cyTranslation = Object.assign(cyTranslationText, cyPersonWithSignificantControlText);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Other registrable person Page", () => {
    it.each([
      ["English", "en", enTranslation],
      ["Welsh", "cy", cyTranslation]
    ])(
      "should load the add other registrable person page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addOtherRegistrablePerson.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addOtherRegistrablePerson);
      }
    );

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(
        getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL)
      );

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });

    it("should load data from api", async () => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL);

      const personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(personWithSignificantControl?.data?.legal_entity_name ?? ""));
    });
  });
});


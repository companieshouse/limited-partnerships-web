import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_URL
} from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControl";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

describe("Add Relevant Legal Entity Page", () => {
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Relevant Legal Entity Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the add relevant legal entity page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addRelevantLegalEntity.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addRelevantLegalEntity);
      }
    );

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(
        getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL)
      );

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post Add Relevant Legal Entity Page", () => {
    it("should send the relevant legal entity details", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          ...personWithSignificantControl.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(1);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();

      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "Legal entity name is invalid" }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          ...personWithSignificantControl.data,
          legal_entity_name: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
    });
  });
});

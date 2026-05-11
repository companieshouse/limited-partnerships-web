import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";
import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Add Person With Significant Control Individual Person Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL);
  const REDIRECT_URL = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Individual Person Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the add individual person page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addPersonWithSignificantControl.addIndividualPerson.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addPersonWithSignificantControl, [
          "addOtherRegistrablePerson",
          "addRelevantLegalEntity",
          "commonEntityFields"
        ]);
      }
    );

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(
        getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL)
      );

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });

    it("should load data from api", async () => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL);

      const personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(personWithSignificantControl?.data?.forename ?? ""));
    });
  });

  describe("Post Add Individual Person Page", () => {
    it("should send the individual person details", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(1);
      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.type).toEqual(
        PersonWithSignificantControlType.INDIVIDUAL_PERSON
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      const apiErrors: ApiErrors = {
        errors: { forename: "Forename is invalid" }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Forename is invalid");
    });
  });

  describe("Patch Add Individual Person Page", () => {
    const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL);
    let personWithSignificantControl: TransactionPersonWithSignificantControl;

    beforeEach(() => {
      personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);
    });

    it("should update the individual person details", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "forename updated"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(
        appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.forename
      ).toEqual("forename updated");
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "Forename is invalid" }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Forename is invalid");
    });
  });
});

import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  CHECK_YOUR_ANSWERS_URL,
  REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL,
  TELL_US_ABOUT_PSC_URL,
} from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import PersonWithSignificantControlBuilder, { personWithSignificantControlOtherRegistrablePerson, personWithSignificantControlRelevantLegalEntity } from "../../../builder/PersonWithSignificantControl";

describe("Review Persons With Significant Control Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };

  const URL = getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL);
  const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL);

  const pscId = appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId;

  const pscRelevantLegalEntity = new PersonWithSignificantControlBuilder()
    .isRelevantLegalEntity()
    .withId(pscId)
    .build();

  const pscOtherRegistrablePerson = new PersonWithSignificantControlBuilder()
    .isOtherRegistrablePerson()
    .withId(pscId)
    .build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRelevantLegalEntity, pscOtherRegistrablePerson]);
  });

  describe("Get Review Persons With Significant Control Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the review persons with significant control page with %s text", async (language: string, lang: string, translationText: Record<string, any>) => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.reviewPersonsWithSignificantControlPage.title} - ${translationText.serviceRegistration} - GOV.UK`
      );

      testTranslations(res.text, translationText.reviewPersonsWithSignificantControlPage, ["emptyList"]);

      expect(res.text).toContain(`${personWithSignificantControlRelevantLegalEntity.legal_entity_name}`);
      expect(res.text).toContain(`${personWithSignificantControlOtherRegistrablePerson.legal_entity_name}`);
      // expect(res.text).toContain(
      //   `You must provide all information for ${pscOtherRegistrablePerson.legal_entity_name} before continuing. Select Change to provide more information`
      // );
    });

    describe("Empty list", () => {
      it("should redirect to person with significant control start page when list is empty", async () => {
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);

        const res = await request(app).get(URL);

        const redirectUrl = getUrl(TELL_US_ABOUT_PSC_URL);
        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });
    });
  });

  describe("Post Review Persons With Significant Control Page", () => {
    it.each([
      ["individual person", "addIndividualPerson", ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL],
      ["relevant legal entity", "addRelevantLegalEntity", ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL],
      ["other registrable person", "addOtherRegistrablePerson", ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL]
    ])('should redirect to the add %s page when selecting to %s', async (personType: string, requestParam: string, redirectUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
        addAnotherPersonWithSignificantControl: requestParam
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(getUrl(redirectUrl));
    });

    it("should redirect to the check your answers page when there is at least one completed person with significant control", async () => {

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
        addAnotherPersonWithSignificantControl: "no"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain(REDIRECT_URL);
    });

    it("should reload the page if no persons with significant control", async () => {
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
        addAnotherPersonWithSignificantControl: "no"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.personWithSignificantControl.reviewPersonsWithSignificantControlPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
    });

    it("should render the review persons with significant control page with errors", async () => {
      const pscRelevantLegalEntity = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(pscId)
        .build();

      const pscOtherRegistrablePerson = new PersonWithSignificantControlBuilder()
        .isOtherRegistrablePerson()
        .withId(pscId)
        .withCompleted(false)
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRelevantLegalEntity, pscOtherRegistrablePerson]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
        addAnotherPersonWithSignificantControl: "no"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `You must provide all information for ${pscOtherRegistrablePerson?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });

    it.each([
      ["add a new relevant legal entity", "addRelevantLegalEntity"],
      ["add a new other registrable person", "addOtherRegistrablePerson"],
      ["add a new individual person", "addIndividualPerson"]
    ])("should render the review persons with significant control page when trying to add a new %s if any person data is incomplete", async (description: string, requestParam: string) => {
      const pscRelevantLegalEntity = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(pscId)
        .build();

      const pscOtherRegistrablePerson = new PersonWithSignificantControlBuilder()
        .isOtherRegistrablePerson()
        .withId(pscId)
        .withCompleted(false)
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([pscRelevantLegalEntity, pscOtherRegistrablePerson]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
        addAnotherPersonWithSignificantControl: requestParam
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `You must provide all information for ${pscOtherRegistrablePerson?.data?.legal_entity_name} before continuing. Select Change to provide more information`
      );
    });
  });
});

import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";
import enErrorsTranslationText from "../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL
} from "../../../../controller/registration/url";
import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import RegistrationPageType from "../../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";

let relevantLegalEntity: TransactionPersonWithSignificantControl;
let otherRegistrablePerson: TransactionPersonWithSignificantControl;
let individualPerson: TransactionPersonWithSignificantControl;

const rlePageType = RegistrationPageType.whichTypeOfNatureOfControlRelevantLegalEntity;
const orpPageType = RegistrationPageType.whichTypeOfNatureOfControlOtherRegistrablePerson;
const ipPageType = RegistrationPageType.whichTypeOfNatureOfControlIndividualPerson;

describe("Which Type of Nature of Control Page", () => {
  const rle = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
    territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
    confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
    pscId: "relevantLegalEntityId"
  });

  const orp = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
    territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
    confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
    pscId: "otherRegistrablePersonId"
  });

  const ip = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
    territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
    confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
    pscId: "individualPersonId"
  });

  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText, ...cyErrorsTranslationText };

  beforeEach(() => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    relevantLegalEntity = new PersonWithSignificantControlBuilder()
      .isRelevantLegalEntity()
      .withId("relevantLegalEntityId")
      .build();

    otherRegistrablePerson = new PersonWithSignificantControlBuilder()
      .isOtherRegistrablePerson()
      .withId("otherRegistrablePersonId")
      .build();

    individualPerson = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId("individualPersonId")
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
      relevantLegalEntity,
      otherRegistrablePerson,
      individualPerson
    ]);
  });

  describe("Get Which Type of Nature of Control Page", () => {
    it.each([
      ["en - rle", "en", rle.url, enTranslationText, "relevantLegalEntity"],
      ["cy - rle", "cy", rle.url, cyTranslationText, "relevantLegalEntity"],
      ["en - orp", "en", orp.url, enTranslationText, "otherRegistrablePerson"],
      ["cy - orp", "cy", orp.url, cyTranslationText, "otherRegistrablePerson"],
      ["en - ip", "en", ip.url, enTranslationText, "individualPerson"],
      ["cy - ip", "cy", ip.url, cyTranslationText, "individualPerson"]
    ])(
      "should load the which type of nature of control page with %s text",
      async (_description: string, lang: string, url: string, translationText: any, translationKey: string) => {
        const psc = translationKey === "relevantLegalEntity" ? relevantLegalEntity : translationKey === "otherRegistrablePerson" ? otherRegistrablePerson : individualPerson;

        const res = await request(app).get(`${url}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.whichTypeOfNatureOfControlPage[translationKey].title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(
          res.text,
          translationText.personWithSignificantControl.whichTypeOfNatureOfControlPage[translationKey]
        );

        expect(res.text).toContain(psc.data?.legal_entity_name?.toUpperCase());
      }
    );
  });

  describe("Post Which Type of Nature of Control Page", () => {
    it.each([
      ["orp principal office", orp.url, orp.redirectUrl, orpPageType, "principal_office_address"],
      ["rle principal office", rle.url, rle.redirectUrl, rlePageType, "principal_office_address"],
      ["ip usual residential", ip.url, ip.redirectUrl, ipPageType, "usual_residential_address"]
    ])("should redirect to the territory choice %s address page", async (_description, url, redirectUrl, pageType, addressToDelete) => {
      const personWithSignificantControl = getPscByPageType(pageType);
      delete personWithSignificantControl.data?.[addressToDelete as keyof TransactionPersonWithSignificantControl["data"]];
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

      expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

      const res = await request(app).post(url).send({
        pageType: pageType,
        nature_of_control_types: ["INDIVIDUAL", "FIRM", "TRUST"]
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(redirectUrl);
      expect(personWithSignificantControl.data?.nature_of_control_types).toEqual(["INDIVIDUAL", "FIRM", "TRUST"]);
    });

    it.each([
      ["orp principal office", orp.url, orp.redirectConfirmUrl, orpPageType],
      ["rle principal office", rle.url, rle.redirectConfirmUrl, rlePageType],
      ["ip usual residential", ip.url, ip.redirectConfirmUrl, ipPageType]
    ])("should redirect to the confirm %s address page if the address is already saved", async (_description, url, redirectUrl, pageType) => {
      const personWithSignificantControl = getPscByPageType(pageType);
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

      expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

      const res = await request(app).post(url).send({
        pageType: pageType,
        nature_of_control_types: "INDIVIDUAL"
      });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(redirectUrl);
      expect(personWithSignificantControl.data?.nature_of_control_types).toEqual(["INDIVIDUAL"]);
    });

    it.each([
      ["orp", orp.url, orpPageType, "en", enTranslationText],
      ["rle", rle.url, rlePageType, "en", enTranslationText],
      ["ip", ip.url, ipPageType, "cy", cyTranslationText]
    ])("should render the page with an error if no nature_of_control_types is sent - %s", async (_description, url, pageType, lang, translationText) => {
      const personWithSignificantControl = getPscByPageType(pageType);
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

      expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

      const res = await request(app).post(`${url}?lang=${lang}`).send({
        pageType: pageType,
        nature_of_control_types: []
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.personWithSignificantControl.whichTypeOfNatureOfControl.natureOfControlTypesMissing);
    });
  });
});

function buildPscUrls({ whichUrl, territoryUrl, confirmUrl, pscId }: {
  whichUrl: string;
  territoryUrl: string;
  confirmUrl: string;
  pscId: string;
}): { url: string; redirectUrl: string; redirectConfirmUrl: string } {
  const replaceId = (url: string) => getUrl(url).replace(
    appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId,
    pscId
  );

  return {
    url: replaceId(whichUrl),
    redirectUrl: replaceId(territoryUrl),
    redirectConfirmUrl: replaceId(confirmUrl)
  };
}

function getPscByPageType(pageType: RegistrationPageType): TransactionPersonWithSignificantControl {
  const pageTypeToPscMap = new Map<RegistrationPageType, TransactionPersonWithSignificantControl>([
    [
      rlePageType,
      relevantLegalEntity
    ],
    [
      orpPageType,
      otherRegistrablePerson
    ],
    [
      ipPageType,
      individualPerson
    ]
  ]);
  return pageTypeToPscMap.get(pageType)!;
}

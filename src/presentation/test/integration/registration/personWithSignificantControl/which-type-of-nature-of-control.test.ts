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
  ADD_NATURE_OF_CONTROL_FIRM_URL,
  ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL,
  ADD_NATURE_OF_CONTROL_TRUST_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";
import { NatureOfControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

let relevantLegalEntity: TransactionPersonWithSignificantControl;
let otherRegistrablePerson: TransactionPersonWithSignificantControl;
let individualPerson: TransactionPersonWithSignificantControl;

const rlePageType = RegistrationPageType.whichTypeOfNatureOfControlRelevantLegalEntity;
const orpPageType = RegistrationPageType.whichTypeOfNatureOfControlOtherRegistrablePerson;
const ipPageType = RegistrationPageType.whichTypeOfNatureOfControlIndividualPerson;

describe("Which Type of Nature of Control Page", () => {
  const rle = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
    backUrl: ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
    pscId: "relevantLegalEntityId"
  });

  const orp = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
    backUrl: ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL,
    pscId: "otherRegistrablePersonId"
  });

  const ip = buildPscUrls({
    whichUrl: WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
    backUrl: ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL,
    pscId: "individualPersonId"
  });

  const enTranslationText = {
    ...enGeneralTranslationText,
    ...enPersonWithSignificantControlTranslationText,
    ...enErrorsTranslationText
  };
  const cyTranslationText = {
    ...cyGeneralTranslationText,
    ...cyPersonWithSignificantControlTranslationText,
    ...cyErrorsTranslationText
  };

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
      ["en - rle", "en", rle.url, rle.backUrl, enTranslationText, "relevantLegalEntity"],
      ["cy - rle", "cy", rle.url, rle.backUrl, cyTranslationText, "relevantLegalEntity"],
      ["en - orp", "en", orp.url, orp.backUrl, enTranslationText, "otherRegistrablePerson"],
      ["cy - orp", "cy", orp.url, orp.backUrl, cyTranslationText, "otherRegistrablePerson"],
      ["en - ip", "en", ip.url, ip.backUrl, enTranslationText, "individualPerson"],
      ["cy - ip", "cy", ip.url, ip.backUrl, cyTranslationText, "individualPerson"]
    ])(
      "should load the which type of nature of control page with %s text",
      async (_description: string, lang: string, url: string, backUrl: string, translationText: any, translationKey: string) => {
        const psc =
          translationKey === "relevantLegalEntity" ? relevantLegalEntity
            : translationKey === "otherRegistrablePerson" ? otherRegistrablePerson
              : individualPerson;

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
        expect(res.text).toContain(backUrl);
      }
    );
  });

  describe("Post Which Type of Nature of Control Page", () => {
    it.each([
      [
        `ORP ${NatureOfControlType.INDIVIDUAL}`,
        orp.url,
        [NatureOfControlType.INDIVIDUAL, NatureOfControlType.FIRM, NatureOfControlType.TRUST],
        orp.nocIndividualUrl,
        orpPageType
      ],
      [
        `RLE ${NatureOfControlType.FIRM}`,
        rle.url,
        [NatureOfControlType.FIRM, NatureOfControlType.TRUST],
        rle.nocFirmUrl,
        rlePageType
      ],
      [`IP ${NatureOfControlType.TRUST}`, ip.url, [NatureOfControlType.TRUST], ip.nocTrustUrl, ipPageType]
    ])(
      "should redirect %s page - multiple selection",
      async (_description, url, natureOfControlTypes, redirectUrl, pageType) => {
        const personWithSignificantControl = getPscByPageType(pageType);
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
          personWithSignificantControl
        ]);

        expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

        const res = await request(app).post(url).send({
          pageType: pageType,
          nature_of_control_types: natureOfControlTypes
        });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe(redirectUrl);
        expect(personWithSignificantControl.data?.nature_of_control_types).toEqual(natureOfControlTypes);
      }
    );

    it.each([
      [
        `ORP ${NatureOfControlType.INDIVIDUAL}`,
        orp.url,
        NatureOfControlType.INDIVIDUAL,
        orp.nocIndividualUrl,
        orpPageType
      ],
      [`RLE ${NatureOfControlType.FIRM}`, rle.url, NatureOfControlType.FIRM, rle.nocFirmUrl, rlePageType],
      [`IP ${NatureOfControlType.TRUST}`, ip.url, NatureOfControlType.TRUST, ip.nocTrustUrl, ipPageType]
    ])(
      "should redirect to %s page - single selection",
      async (_description, url, natureOfControlType, redirectUrl, pageType) => {
        const personWithSignificantControl = getPscByPageType(pageType);
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
          personWithSignificantControl
        ]);

        expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

        const res = await request(app).post(url).send({
          pageType: pageType,
          nature_of_control_types: natureOfControlType
        });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe(redirectUrl);
        expect(personWithSignificantControl.data?.nature_of_control_types).toEqual([natureOfControlType]);
      }
    );

    it.each([
      ["orp", orp.url, orpPageType, "en", enTranslationText],
      ["rle", rle.url, rlePageType, "en", enTranslationText],
      ["ip", ip.url, ipPageType, "cy", cyTranslationText]
    ])(
      "should render the page with an error if no nature_of_control_types is sent - %s",
      async (_description, url, pageType, lang, translationText) => {
        const personWithSignificantControl = getPscByPageType(pageType);
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
          personWithSignificantControl
        ]);

        expect(personWithSignificantControl.data?.nature_of_control_types).toBeNull();

        const res = await request(app).post(`${url}?lang=${lang}`).send({
          pageType: pageType,
          nature_of_control_types: []
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          translationText.errorMessages.personWithSignificantControl.whichTypeOfNatureOfControl
            .natureOfControlTypesMissing
        );
      }
    );
  });
});

function buildPscUrls({ whichUrl, backUrl, pscId }: { whichUrl: string; backUrl: string; pscId: string }): {
  url: string;
  backUrl: string;
  nocIndividualUrl: string;
  nocFirmUrl: string;
  nocTrustUrl: string;
} {
  const replaceId = (url: string) =>
    getUrl(url).replace(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId, pscId);

  return {
    url: replaceId(whichUrl),
    backUrl: replaceId(backUrl),
    nocIndividualUrl: replaceId(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL),
    nocFirmUrl: replaceId(ADD_NATURE_OF_CONTROL_FIRM_URL),
    nocTrustUrl: replaceId(ADD_NATURE_OF_CONTROL_TRUST_URL)
  };
}

function getPscByPageType(pageType: RegistrationPageType): TransactionPersonWithSignificantControl {
  const pageTypeToPscMap = new Map<RegistrationPageType, TransactionPersonWithSignificantControl>([
    [rlePageType, relevantLegalEntity],
    [orpPageType, otherRegistrablePerson],
    [ipPageType, individualPerson]
  ]);
  return pageTypeToPscMap.get(pageType)!;
}

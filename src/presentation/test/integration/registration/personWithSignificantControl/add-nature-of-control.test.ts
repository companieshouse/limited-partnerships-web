import request from "supertest";
import {
  NatureOfControlType,
  PersonWithSignificantControlType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";
import enErrorsTranslationText from "../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import {
  ADD_NATURE_OF_CONTROL_FIRM_URL,
  ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL,
  ADD_NATURE_OF_CONTROL_TRUST_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL
} from "../../../../controller/registration/url";
import { CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";

import RegistrationPageType from "../../../../controller/registration/PageType";

describe("Add Nature of Control Page", () => {
  let individualPerson: TransactionPersonWithSignificantControl;

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

    individualPerson = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();
    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([individualPerson]);
  });

  describe("Get Add Nature of Control Page", () => {
    it.each([
      [`en - ${NatureOfControlType.INDIVIDUAL}`, "en", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), enTranslationText, ["firm"]],
      [`cy - ${NatureOfControlType.INDIVIDUAL}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), cyTranslationText, ["firm"]],
      [`en - ${NatureOfControlType.FIRM}`, "en", getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL), enTranslationText, ["individual"]],
      [`cy - ${NatureOfControlType.FIRM}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL), cyTranslationText, ["individual"]]
      // [`en - ${NatureOfControlType.TRUST}`, "en", getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL), enTranslationText, ["individual"]],
      // [`cy - ${NatureOfControlType.TRUST}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL), cyTranslationText, ["individual"]]
    ])(
      "should load the add nature of control page - %s",
      async (_description: string, lang: string, url: string, translationText: Record<string, any>, excludedTexts: string[]) => {
        const res = await request(app).get(`${url}?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.personWithSignificantControl.addNatureOfControlPage, excludedTexts);

        expect(res.text).toContain(individualPerson.data?.legal_entity_name?.toUpperCase());

        const backUrl = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL);
        expect(res.text).toContain(backUrl);
      }
    );

    it.each([
      [PersonWithSignificantControlType.INDIVIDUAL_PERSON, "individual"],
      [PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY, "RLE"],
      [PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON, "ORP"]
    ])(
      "should load the add nature of control page with text depending of the PSC type - %s",
      async (type: string, expectedText: string) => {
        const personWithSignificantControlBuilder = new PersonWithSignificantControlBuilder().withId(
          appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId
        );

        if (type === PersonWithSignificantControlType.INDIVIDUAL_PERSON) {
          personWithSignificantControlBuilder.isIndividualPerson();
        } else if (type === PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY) {
          personWithSignificantControlBuilder.isRelevantLegalEntity();
        } else if (type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
          personWithSignificantControlBuilder.isOtherRegistrablePerson();
        }

        const personWithSignificantControl = personWithSignificantControlBuilder.build();

        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

        const URL = getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          toEscapedHtml(
            enPersonWithSignificantControlTranslationText.personWithSignificantControl.addNatureOfControlPage.individual.title.replace(
              "individual",
              expectedText
            )
          )
        );
      }
    );

    it.each([
      [
        "Which type",
        NatureOfControlType.INDIVIDUAL,
        RegistrationPageType.addNatureOfControlIndividual,
        getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL),
        getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL)
      ],
      [
        "Individual",
        NatureOfControlType.FIRM,
        RegistrationPageType.addNatureOfControlFirm,
        getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL),
        getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL)
      ],
      [
        "Trust",
        NatureOfControlType.TRUST,
        RegistrationPageType.addNatureOfControlTrust,
        getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL),
        getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL)
      ]
    ])(
      "should have the correct back link to the %s page",
      async (_description: string, type, pageType, url, backLinkUrl: string) => {
        const personWithNatureOfControl = new PersonWithSignificantControlBuilder()
          .isIndividualPerson()
          .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
          .withNatureOfControlTypes([NatureOfControlType.INDIVIDUAL, NatureOfControlType.FIRM, NatureOfControlType.TRUST])
          .build();

        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithNatureOfControl]);

        const res = await request(app).get(url);

        expect(res.status).toBe(200);

        expect(res.text).toContain(backLinkUrl);
      }
    );

    it.each([
      [NatureOfControlType.INDIVIDUAL, getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL)],
      [NatureOfControlType.FIRM, getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL)]
    ])("should load the add nature of control page with data from api - %s", async (type: string, url: string) => {
      const personWithNatureOfControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .withNaturesOfControl([
          {
            type: NatureOfControlType.INDIVIDUAL,
            share_of_assets_25_to_50: true,
            voting_rights_25_to_50: true,
            right_to_appointment_and_remove: true
          },
          {
            type: NatureOfControlType.FIRM,
            share_of_assets_25_to_50: true,
            voting_rights_25_to_50: true,
            right_to_appointment_and_remove: true
          }
        ])
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithNatureOfControl]);

      const res = await request(app).get(url);

      expect(res.status).toBe(200);

      expect(res.text).toContain(individualPerson.data?.legal_entity_name?.toUpperCase());

      expect(res.text).toContain(type);
      expect(res.text).toContain('value="share_of_assets_25_to_50" checked');
      expect(res.text).not.toContain('value="share_of_assets_50_to_75" checked');
      expect(res.text).toContain('value="voting_rights_25_to_50" checked');
      expect(res.text).not.toContain('value="voting_rights_50_to_75" checked');
      expect(res.text).toContain('name="right_to_appointment_and_remove" type="checkbox" value="true" checked');
      expect(res.text).not.toContain('name="significant_influence_control" type="checkbox" value="true" checked');
    });
  });

  describe("Post Add Nature of Control Page", () => {
    it.each([
      [
        "Firm",
        NatureOfControlType.INDIVIDUAL,
        RegistrationPageType.addNatureOfControlIndividual,
        getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL),
        getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL)
      ],
      [
        "Trust",
        NatureOfControlType.FIRM,
        RegistrationPageType.addNatureOfControlFirm,
        getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL),
        getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL)
      ],
      [
        "Confirm Address",
        NatureOfControlType.TRUST,
        RegistrationPageType.addNatureOfControlTrust,
        getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL),
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL)
      ]
    ])("should redirect to the %s page", async (_description: string, type, pageType, url, redirectUrl: string) => {
      const personWithNatureOfControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .withNatureOfControlTypes([NatureOfControlType.INDIVIDUAL, NatureOfControlType.FIRM, NatureOfControlType.TRUST])
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithNatureOfControl]);

      const res = await request(app).post(url).send({
        pageType: pageType,
        type: type,
        share_of_assets: "share_of_assets_25_to_50",
        voting_rights: "voting_rights_25_to_50"
      });

      expect(res.status).toBe(302);

      expect(res.headers.location).toBe(redirectUrl);
    });

    it("should update the list of natures of control when there is an existing nature of control with the same type", async () => {
      const existingNatureOfControl = {
        type: NatureOfControlType.INDIVIDUAL,
        share_of_assets_25_to_50: true,
        voting_rights_25_to_50: true
      };

      individualPerson = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .withNaturesOfControl([existingNatureOfControl])
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([individualPerson]);

      const res = await request(app).post(getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL)).send({
        pageType: RegistrationPageType.addNatureOfControlIndividual,
        type: NatureOfControlType.INDIVIDUAL,
        share_of_assets: "share_of_assets_50_to_75",
        voting_rights: "voting_rights_25_to_50"
      });

      expect(res.status).toBe(302);

      expect(individualPerson.data?.natures_of_control).toEqual([
        expect.objectContaining({
          type: NatureOfControlType.INDIVIDUAL,
          share_of_assets_50_to_75: true,
          voting_rights_25_to_50: true
        })
      ]);

      expect(individualPerson?.data?.natures_of_control?.[0]?.share_of_assets_25_to_50).toBeUndefined();
    });

    it.each([
      [
        "no nature of control is selected",
        {},
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.youMustSelectAtLeastOne
      ],
      [
        "share of assets is not selected",
        {
          voting_rights: "voting_rights_25_to_50",
          right_to_appointment_and_remove: true,
          significant_influence_control: false
        },
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.shareOfAssetsMissing
      ],
      [
        "voting rights is not selected",
        {
          share_of_assets: "share_of_assets_25_to_50",
          right_to_appointment_and_remove: true,
          significant_influence_control: false
        },
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.votingRightsMissing
      ],
      [
        "both right to appointment and remove and significant influence control are selected",
        {
          share_of_assets: "share_of_assets_25_to_50",
          voting_rights: "voting_rights_25_to_50",
          right_to_appointment_and_remove: true,
          significant_influence_control: true
        },
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.significantInfluence
      ],
      [
        "significant influence control is selected with share of assets or voting rights percentages",
        {
          share_of_assets: "share_of_assets_25_to_50",
          voting_rights: "voting_rights_25_to_50",
          right_to_appointment_and_remove: false,
          significant_influence_control: true
        },
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.significantInfluence
      ],
      [
        "no share of assets or voting rights percentages are selected and neither right to appointment and remove nor significant influence control are selected",
        {
          right_to_appointment_and_remove: false,
          significant_influence_control: false
        },
        enTranslationText.errorMessages.personWithSignificantControl.addNatureOfControl.individual.youMustSelectAtLeastOne
      ]
    ])(
      "should return a validation error when %s",
      async (_description: string, requestBody: Record<string, any>, errorMessage: string) => {
        const res = await request(app)
          .post(getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL))
          .send({
            pageType: RegistrationPageType.addNatureOfControlIndividual,
            type: NatureOfControlType.INDIVIDUAL,
            ...requestBody
          });

        expect(res.status).toBe(200);
        expect(countOccurrences(res.text, toEscapedHtml(errorMessage))).toBe(1);
      }
    );

    it("should replay the form with the previously entered values when there is a validation error", async () => {
      const res = await request(app).post(getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL)).send({
        pageType: RegistrationPageType.addNatureOfControlIndividual,
        type: NatureOfControlType.INDIVIDUAL,
        share_of_assets: "share_of_assets_25_to_50",
        voting_rights: "voting_rights_25_to_50",
        right_to_appointment_and_remove: true,
        significant_influence_control: true
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain('value="share_of_assets_25_to_50" checked');
      expect(res.text).toContain('value="voting_rights_25_to_50" checked');
      expect(res.text).toContain('name="right_to_appointment_and_remove" type="checkbox" value="true" checked');
      expect(res.text).toContain('name="significant_influence_control" type="checkbox" value="true" checked');
    });
  });
});

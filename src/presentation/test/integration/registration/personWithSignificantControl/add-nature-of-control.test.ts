import request from "supertest";
import { NatureOfControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

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
  // ADD_NATURE_OF_CONTROL_FIRM_URL,
  ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL,
  // ADD_NATURE_OF_CONTROL_TRUST_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL
} from "../../../../controller/registration/url";
import { CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";

import RegistrationPageType from "../../../../controller/registration/PageType";

describe("Which Type of Nature of Control Page", () => {
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
      [`en - ${NatureOfControlType.INDIVIDUAL}`, "en", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), enTranslationText, []],
      [`cy - ${NatureOfControlType.INDIVIDUAL}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), cyTranslationText, []]
      // [`en - ${NatureOfControlType.FIRM}`, "en", getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL), enTranslationText, ["individual"]],
      // [`cy - ${NatureOfControlType.FIRM}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL), cyTranslationText, ["individual"]],
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
      [`en - ${NatureOfControlType.INDIVIDUAL}`, "en", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), enTranslationText, []],
      [`cy - ${NatureOfControlType.INDIVIDUAL}`, "cy", getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL), cyTranslationText, []]
    ])(
      "should load the add nature of control page with data from api - %s",
      async (_description: string, lang: string, url: string, translationText: Record<string, any>, excludedTexts: string[]) => {
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
              share_of_assets_50_to_75: true,
              voting_rights_50_to_75: true,
              right_to_appointment_and_remove: true
            }
          ])
          .build();

        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithNatureOfControl]);

        const res = await request(app).get(`${url}?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.personWithSignificantControl.addNatureOfControlPage, excludedTexts);

        expect(res.text).toContain(individualPerson.data?.legal_entity_name?.toUpperCase());

        expect(res.text).toContain('value="share_of_assets_25_to_50" checked');
        expect(res.text).not.toContain('value="share_of_assets_50_to_75" checked');
        expect(res.text).toContain('value="voting_rights_25_to_50" checked');
        expect(res.text).not.toContain('value="voting_rights_50_to_75" checked');
        expect(res.text).toContain('name="right_to_appointment_and_remove" type="checkbox" value="true" checked');
        expect(res.text).not.toContain('name="significant_influence_control" type="checkbox" value="true" checked');

        const backUrl = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL);
        expect(res.text).toContain(backUrl);
      }
    );
  });

  describe("Post Add Nature of Control Page", () => {
    it.each([
      [
        NatureOfControlType.INDIVIDUAL,
        RegistrationPageType.addNatureOfControlIndividual,
        getUrl(ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL)
      ]
      // [NatureOfControlType.FIRM, RegistrationPageType.addNatureOfControlFirm, getUrl(ADD_NATURE_OF_CONTROL_FIRM_URL)],
      // [NatureOfControlType.TRUST, RegistrationPageType.addNatureOfControlTrust, getUrl(ADD_NATURE_OF_CONTROL_TRUST_URL)]
    ])("should redirect to confirm address page - %s", async (type, pageType, url) => {
      const res = await request(app).post(url).send({
        pageType: pageType,
        type: type,
        share_of_assets: "share_of_assets_25_to_50",
        voting_rights: "voting_rights_25_to_50"
      });

      expect(res.status).toBe(302);

      const redirectUrl = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.headers.location).toBe(redirectUrl);
      expect(individualPerson.data?.natures_of_control).toEqual([
        expect.objectContaining({
          type: type,
          share_of_assets_25_to_50: true,
          voting_rights_25_to_50: true
        })
      ]);
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

      const redirectUrl = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.headers.location).toBe(redirectUrl);

      expect(individualPerson.data?.natures_of_control).toEqual([
        expect.objectContaining({
          type: NatureOfControlType.INDIVIDUAL,
          share_of_assets_50_to_75: true,
          voting_rights_25_to_50: true
        })
      ]);

      expect(individualPerson?.data?.natures_of_control?.[0]?.share_of_assets_25_to_50).toBeUndefined();
    });
  });
});

import request from "supertest";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControl";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL } from "../../../../../controller/registration/url";

describe("Confirm PSC Principal Office Address Page", () => {
  const URL = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        principal_office_address: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });

    const personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isRelevantLegalEntity()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);
  });

  describe("GET Confirm PSC Principal Office Address Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the confirm PSC principal office address page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(res.text, translationText.address.confirm.personWithSignificantControlPrincipalOfficeAddress);

        expect(res.text).toContain("4 Line 1");
        expect(res.text).toContain("Line 2");
        expect(res.text).toContain("Stoke-On-Trent");
        expect(res.text).toContain("Region");
        expect(res.text).toContain("ST6 3LJ");
      }
    );

    it.each([
      ["overseas", getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["unitedKingdom", getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)]
    ])("should have the correct back link for territory %s", async (territory, backLink) => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          poa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });
  });

  describe("POST Confirm PSC Principal Office Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      // LP-1778: Update redirect URL when PSC summary page is implemented
      const redirectUrl = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it.each([
      ["en", enErrorMessages],
      ["cy", cyErrorMessages]
    ])("should show validation error message if country is missing with lang %s", async (lang: string, errorMessagesJson: any) => {
      setLocalesEnabled(true);
      const res = await request(app).post(`${URL}?lang=${lang}`).send({
        pageType: AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});

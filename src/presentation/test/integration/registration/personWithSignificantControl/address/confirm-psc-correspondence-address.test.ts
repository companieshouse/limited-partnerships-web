import request from "supertest";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
} from "../../../../../controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import TransactionPersonWithSignificantControl from "../../../../../../domain/entities/TransactionPersonWithSignificantControl";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";
import { CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/registration/url";

describe("Confirm PSC correspondence Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorMessages };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorMessages };

  const URL = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const MANUAL_ENTRY_URL = getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL);

  const pageType = AddressPageType.confirmPersonWithSignificantControlIndividualPersonCorrespondenceAddress;

  let personWithSignificantControl: TransactionPersonWithSignificantControl;
  beforeEach(() => {
    setLocalesEnabled(true);

    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        service_address: {
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
  });

  describe("GET Confirm PSC correspondence Address Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])(
      "should load the confirm PSC correspondence address page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(res.text, translationText.address.confirm.personWithSignificantControlCorrespondenceAddress);

        expect(res.text).toContain("4 Line 1");
        expect(res.text).toContain("Line 2");
        expect(res.text).toContain("Stoke-On-Trent");
        expect(res.text).toContain("Region");
        expect(res.text).toContain("ST6 3LJ");

        expect(res.text).toContain(
          [
            personWithSignificantControl?.data?.forename,
            personWithSignificantControl?.data?.middle_names,
            personWithSignificantControl?.data?.surname
          ].join(' ').toUpperCase()
        );
      }
    );

    it.each([
      [
        "overseas",
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL)
      ],
      [
        "unitedKingdom",
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL)
      ]
    ])("should have the correct back link for territory for %s", async (territory: string, backLink: string) => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    }
    );

    it("should redirect to manual address page if address is incomplete", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          service_address: {
            postal_code: "ST6 3LJ",
            premises: "4",
            address_line_1: "line 1",
            address_line_2: "line 2",
            locality: "stoke-on-trent",
            region: "region",
            country: null
          }
        }
      });

      const res = await request(app).get(URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${MANUAL_ENTRY_URL}`);
    }
    );
  });

  describe("POST Confirm PSC correspondence Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    }
    );

    it.each([
      [
        "en",
        enTranslationText
      ],
      [
        "cy",
        cyTranslationText
      ]
    ])(
      "should show validation error message if country is missing with lang %s",
      async (lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);
        const res = await request(app).post(`${URL}?lang=${lang}`).send({
          pageType,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": ""
          }`
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.errorMessages.address.confirm.countryMissing);
      }
    );
  });
});

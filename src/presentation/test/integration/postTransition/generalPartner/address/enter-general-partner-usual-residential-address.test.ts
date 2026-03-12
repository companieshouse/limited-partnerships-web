import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";

import * as config from "../../../../../../config";
import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Enter Usual Residential Address Page", () => {
  const URL = getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
    appDevDependencies.companyGateway.feedCompanyProfile([]);
  });

  describe("GET Enter general partners usual residential address", () => {
    it.each(
      [
        ["add", "en"],
        ["add", "cy"],
        ["update", "en"],
        ["update", "cy"]
      ]
    )("should load %s enter general partners usual residential address page with %s text", async (journey: string, lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(URL + "?lang=" + lang);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "correspondenceAddress",
        "principalOfficeAddress",
        "postcodeOptional",
        "limitedPartner",
        "errorMessages",
        "countryEngland",
        "countryScotland",
        "countryWales",
        "countryNorthernIreland"
      ]);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }

      expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
      const expectedServiceNameTranslation = journey === "add" ? translationText.serviceName.addGeneralPartner : translationText.serviceName.updateGeneralPartnerPerson;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceNameTranslation))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["update", "overseas", getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["update", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)]
    ])("should have the correct back link for journey %s and territory %s", async (journey, territory, backLink) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });

    it.each([
      ["cache", true, false],
      ["db", false, true],
      ["cache", true, true]
    ])("should pre-populate the enter general partners principal office address manual entry page with address from %s when has address in cache is %s and has address in db is %s", async (addressSource: string, hasCache: boolean, hasDbAddress: boolean) => {

      const { expectedAddress } = setupAddressTestState(hasCache, hasDbAddress);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedAddress.address_line_1);
      expect(res.text).toContain(expectedAddress.address_line_2);
      expect(res.text).toContain(expectedAddress.locality);
      expect(res.text).toContain(expectedAddress.postal_code);
      expect(res.text).toContain(expectedAddress.premises);
      expect(res.text).toContain(expectedAddress.region);
      expect(res.text).toContain(expectedAddress.country);
    });
  });

  describe("POST Enter general partners usual residential address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
        postal_code: "CF3 2DS",
        premises: "4",
        address_line_1: "DUNCALF STREET",
        address_line_2: "",
        locality: "STOKE-ON-TRENT",
        country: "England"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          usual_residential_address: {
            postal_code: "CF3 2DS",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "England",
            region: undefined
          }
        }
      });
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should redirect if postcode is null", async () => {
      const apiErrors: ApiErrors = {
        errors: {
          "usualResidentialAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
        address: `{
          "postal_code": "",
          "premises": "4",
          "address_line_1": "DUNCALF STREET",
          "address_line_2": "",
          "locality": "STOKE-ON-TRENT",
          "country": "England"
        }`
      });

      expect(res.status).toBe(302);
      expect(res.text).not.toContain("must not be null");
    });

    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          postal_code: "here",
          country: "Vatican City"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when a UK address and postcode format is invalid", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );
    });

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return validation errors when address fields contain invalid characters", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          premises: "±",
          address_line_1: "±",
          address_line_2: "±",
          locality: "±",
          region: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.premises +
        " " +
        enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.addressLine1 +
        " " +
        enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.addressLine2Title +
        " " +
        enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.locality +
        " " +
        enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.regionTitle +
        " " +
        enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return validation errors when address fields exceed character limit", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          premises: "toomanycharacters".repeat(13),
          address_line_1: "toomanycharacters".repeat(4),
          address_line_2: "toomanycharacters".repeat(4),
          locality: "toomanycharacters".repeat(4),
          region: "toomanycharacters".repeat(4)
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.premisesLength);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.addressLine1Length);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.addressLine2Length);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.localityLength);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.regionLength);
    });
  });
});

function setupAddressTestState(hasCache: boolean, hasDbAddress: boolean) {
  let expectedAddress;

  if (hasCache) {
    expectedAddress = {
      address_line_1: "cached address line 1",
      address_line_2: "cached address line 2",
      country: "England",
      locality: "cached locality",
      postal_code: "CF1 1AA",
      premises: "22",
      region: "cached region"
    };
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        usual_residential_address: expectedAddress
      }
    });
  }
  if (hasDbAddress && !hasCache) {
    expectedAddress = {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "usual residential address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    };
  }
  if (hasDbAddress) {
    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  }

  return { expectedAddress };
}

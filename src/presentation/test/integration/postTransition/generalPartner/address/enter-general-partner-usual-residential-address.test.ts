import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import * as config from "../../../../../../config";

import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Enter Usual Residential Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET Enter general partners usual residential address", () => {
    it.each([
      [PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.addGeneralPartner],
      [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.updateGeneralPartnerPerson]
    ])(
      "should load enter general partners usual residential address page with english text",
      async (partnerKind, serviceName) => {
        setLocalesEnabled(true);

        const transaction = new TransactionBuilder().withKind(partnerKind).build();
        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.address.enterAddress, [
          "registeredOfficeAddress",
          "principalPlaceOfBusinessAddress",
          "jurisdictionCountry",
          "postcodeMissing",
          "correspondenceAddress",
          "principalOfficeAddress",
          "postcodeOptional",
          "limitedPartner",
          "errorMessages",
          // uk countries
          "countryEngland",
          "countryScotland",
          "countryWales",
          "countryNorthernIreland"
        ]);
        expect(res.text).not.toContain("WELSH -");
        expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase());
        expect(res.text).toContain(generalPartnerPerson.surname?.toUpperCase());
        expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
        expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
      }
    );

    it.each([
      [PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.addGeneralPartner],
      [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.updateGeneralPartnerPerson]
    ])(
      "should load enter general partners usual residential address manual entry page with welsh text",
      async (partnerKind, serviceName) => {
        setLocalesEnabled(true);

        const transaction = new TransactionBuilder().withKind(partnerKind).build();
        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: "overseas"
          }
        });

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        testTranslations(res.text, cyTranslationText.address.enterAddress, [
          "registeredOfficeAddress",
          "principalPlaceOfBusinessAddress",
          "jurisdictionCountry",
          "postcodeMissing",
          "postcode",
          "correspondenceAddress",
          "principalOfficeAddress",
          "limitedPartner",
          "errorMessages",
          // uk countries
          "countryEngland",
          "countryScotland",
          "countryWales",
          "countryNorthernIreland"
        ]);

        expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase());
        expect(res.text).toContain(generalPartnerPerson.surname?.toUpperCase());
        expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
        expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
      }
    );

    it("should load enter general partners usual residential address manual entry page with overseas back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice: "overseas"
        }
      });

      const redirectUrl = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(redirectUrl);
    });

    it("should load enter general partners usual residential address manual entry page with postcode lookup back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice: "unitedKingdom"
        }
      });
      const redirectUrl = getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(redirectUrl);
    });
  });

  describe("POST Enter general partners usual residential address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ["usual_residential_address"]: {
            address_line_1: "",
            address_line_2: "",
            country: "",
            locality: "",
            postal_code: "",
            premises: "",
            region: ""
          }
        }
      });
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
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

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

    it("should redirect to the confirm general partners usual residential address page", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should redirect if postcode is null", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
        postal_code: "",
        premises: "4",
        address_line_1: "DUNCALF STREET",
        address_line_2: "",
        locality: "STOKE-ON-TRENT",
        country: "France"
      });

      expect(res.status).toBe(302);
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

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
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
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesInvalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Invalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Invalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityInvalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionInvalid);
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
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesLength);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Length);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Length);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityLength);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionLength);
    });
  });
});

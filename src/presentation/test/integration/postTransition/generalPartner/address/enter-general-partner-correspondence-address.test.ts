import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";

import * as config from "config";
import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../../../../presentation/test/builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../../../../presentation/test/builder/CompanyProfileBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_PERSON } from "config";

describe("Enter Correspondence Address Page", () => {
  const URL = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  let generalPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withServiceAddress()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET Enter general partners correspondence address", () => {
    it.each(
      [
        [PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.addGeneralPartner],
        [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.updateGeneralPartnerPerson]
      ]
    )("should load enter general partners correspondence address page with english text", async (partnerKind, serviceName) => {
      setLocalesEnabled(true);

      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "limitedPartner",
        "postcodeOptional",
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
    });

    it.each(
      [
        [PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.addGeneralPartner],
        [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.updateGeneralPartnerPerson]
      ]
    )("should load enter general partners correspondence address manual entry page with welsh text", async (partnerKind, serviceName) => {
      setLocalesEnabled(true);

      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          sa_territory_choice: "overseas"
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
        "usualResidentialAddress",
        "limitedPartner",
        "principalOfficeAddress",
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
    });

    it("should load enter general partners correspondence address manual entry page with overseas back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          sa_territory_choice: "overseas"
        }
      });

      const backLinkUrl = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(backLinkUrl);
    });

    it("should load enter general partners correspondence address manual entry page with postcode lookup back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          sa_territory_choice: "unitedKingdom"
        }
      });
      const backLinkUrl = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(backLinkUrl);
    });

    it("should have back link to yes/no page when partner kind is UPDATE_GENERAL_PARTNER_PERSON", async () => {
      const updateGeneralPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([updateGeneralPartner]);

      const backLinkUrl = getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(backLinkUrl);
    });

    it("should pre-populate the enter general partners correspondence address manual entry page when partner kind is UPDATE_GENERAL_PARTNER_PERSON", async () => {
      const updateGeneralPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .withAppointmentId("AP123456")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([updateGeneralPartner]);

      const companyAppointment = new CompanyAppointmentBuilder()
        .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
        .build();
      appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

      const companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(companyAppointment.address?.addressLine1);
      expect(res.text).toContain(companyAppointment.address?.addressLine2);
      expect(res.text).toContain(companyAppointment.address?.locality);
      expect(res.text).toContain(companyAppointment.address?.postalCode);
      expect(res.text).toContain(companyAppointment.address?.premises);
      expect(res.text).toContain(companyAppointment.address?.region);
      expect(res.text).toContain(companyAppointment.address?.country);
    });

    it("should pre-populate the enter general partners correspondence address manual entry page with address from cache", async () => {
      const cacheAddress = {
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
          service_address: cacheAddress
        }
      });

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(cacheAddress.address_line_1);
      expect(res.text).toContain(cacheAddress.address_line_2);
      expect(res.text).toContain(cacheAddress.locality);
      expect(res.text).toContain(cacheAddress.postal_code);
      expect(res.text).toContain(cacheAddress.premises);
      expect(res.text).toContain(cacheAddress.region);
      expect(res.text).toContain(cacheAddress.country);
    });

    it("should pre-populate the enter general partners correspondence address manual entry page with address from limited-partnerships-api", async () => {
      const updateGeneralPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .withAppointmentId("AP123456")
        .withServiceAddress()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([updateGeneralPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.address_line_1);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.address_line_2);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.locality);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.postal_code);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.premises);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.region);
      expect(res.text).toContain(updateGeneralPartner?.data?.service_address?.country);
    });
  });

  describe("POST Enter general partners correspondence address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          service_address: {
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
        pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
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
          service_address: {
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

    it("should redirect to the confirm general partners correspondence address page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
          "correspondenceAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
        address: `{"postal_code": "","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
      });

      expect(res.status).toBe(302);
      expect(res.text).not.toContain("must not be null");
    });

    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address,
          postal_code: "here",
          country: "Vatican City"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return a validation error when a UK address and postcode format is invalid", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address,
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
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return validation errors when address fields contain invalid characters", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address,
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
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
          ...generalPartner.data?.service_address,
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

    describe("UK not mainland", () => {
      describe("uk territory", () => {
        it("should return an error if the postcode is from Jersey", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "JE2 3AA"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(`Enter a UK mainland postcode`);
        });

        it("should return an error if the postcode is from Guernsey", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "GY1 2AL"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(`Enter a UK mainland postcode`);
        });

        it("should return an error if the postcode is from Isle of Man", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "IM2 4NN"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(`Enter a UK mainland postcode`);
        });
      });

      describe("non uk territory", () => {
        it("should return an error if the postcode is from Jersey", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "JE2 3AA",
              country: "Jersey"
            });

          expect(res.status).toBe(302);
        });

        it("should return an error if the postcode is from Guernsey", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "GY1 2AL",
              country: "Guernsey"
            });

          expect(res.status).toBe(302);
        });

        it("should return an error if the postcode is from Isle of Man", async () => {
          const res = await request(app)
            .post(URL)
            .send({
              pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
              ...generalPartner.data?.service_address,
              postal_code: "IM2 4NN",
              country: "Isle of Man"
            });

          expect(res.status).toBe(302);
        });
      });
    });
  });
});

import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder, {
  limitedPartnerLegalEntity,
  limitedPartnerPerson
} from "../../../../builder/LimitedPartnerBuilder";
import * as config from "config";
import {
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../../presentation/controller/addressLookUp/url/postTransition";
import { UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";
import { OFFICER_ROLE_LIMITED_PARTNER_PERSON } from "../../../../../../config";
import CompanyAppointmentBuilder, { principalOfficeAddress } from "../../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";

describe("Enter limited partner's principal office manual address page", () => {
  const URL = getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
    appDevDependencies.companyGateway.feedCompanyProfile([]);
  });

  describe("Get enter limited partner's principal office address page", () => {
    it.each([
      ["add", "en"],
      ["update", "en"],
      ["add", "cy"],
      ["update", "cy"]
    ])("should load %s enter limited partners principal office address page with %s text", async (journey: string, lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;

      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "usualResidentialAddress",
        "correspondenceAddress",
        "errorMessages",
        "generalPartner"
      ]);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }

      expect(res.text).not.toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());

      const expectedServiceName = journey === "add" ? translationText.serviceName.addLimitedPartner : translationText.serviceName.updateLimitedPartnerLegalEntity;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["update", "", getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL)]
    ])("should have the correct back link for journey %s and territory %s", async (journey, territory, backLink) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          poa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });

    it.each([
      ["add", "cache", true, false],
      ["add", "db", false, true],
      ["add", "cache", true, true],
      ["update", "company appointment", false, false],
      ["update", "cache", true, false],
      ["update", "db", false, true],
      ["update", "cache", true, true]
    ])("should pre-populate the %s enter limited partners principal office address manual entry page with address from %s when has address in cache is %s and has address in db is %s", async (journey: string, addressSource: string, hasCache: boolean, hasDbAddress: boolean) => {

      let companyAppointment;

      if (journey === "update") {
        const updateLimitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON)
          .withAppointmentId("AP123456")
          .withPrincipalOfficeAddress(null)
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([updateLimitedPartner]);

        companyAppointment = new CompanyAppointmentBuilder()
          .withOfficerRole(OFFICER_ROLE_LIMITED_PARTNER_PERSON)
          .withPrincipalOfficeAddress(principalOfficeAddress)
          .build();
        appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

        const companyProfile = new CompanyProfileBuilder().build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
      }
      const { expectedAddress } = setupAddressTestState(hasCache, hasDbAddress);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      if (!hasCache && !hasDbAddress && journey === "update") {
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.addressLine1);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.addressLine2);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.locality);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.postalCode);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.premises);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.region);
        expect(res.text).toContain(companyAppointment.principalOfficeAddress.country);
      } else {
        expect(res.text).toContain(expectedAddress.address_line_1);
        expect(res.text).toContain(expectedAddress.address_line_2);
        expect(res.text).toContain(expectedAddress.locality);
        expect(res.text).toContain(expectedAddress.postal_code);
        expect(res.text).toContain(expectedAddress.premises);
        expect(res.text).toContain(expectedAddress.region);
        expect(res.text).toContain(expectedAddress.country);
      }
    });
  });

  describe("Post enter limited partner's principal office address page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
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
          principal_office_address: {
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
      appDevDependencies.addressLookUpGateway.setError(false);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
          ...limitedPartner.data?.principal_office_address,
          postal_code: "here",
          country: "Vatican City"
        });

      const redirectUrl = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return a validation error when a UK address and postcode format is invalid", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
          ...limitedPartner.data?.principal_office_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(
        `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
      );
    });

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
          ...limitedPartner.data?.principal_office_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return validation errors when address fields contain invalid characters", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
          ...limitedPartner.data?.principal_office_address,
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
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
          ...limitedPartner.data?.principal_office_address,
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
        principal_office_address: expectedAddress
      }
    });
  }
  if (hasDbAddress && !hasCache) {
    expectedAddress = {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "principal office address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    };
  }
  if (hasDbAddress) {
    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
  }

  return { expectedAddress };
}

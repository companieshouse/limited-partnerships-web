import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import {
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/transition";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";

describe("Enter general partner's principal office manual address page", () => {
  const URL = getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get enter general partner's principal office address page", () => {
    it("should load enter general partners principal office address page with English text", async () => {
      setLocalesEnabled(true);
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load enter general partners principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });

  describe("Post enter general partner's principal office address page", () => {
    it("should redirect to the error page when error occurs during Post", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
          ...generalPartner.data?.principal_office_address,
          postal_code: "here",
          country: "Vatican City"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
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
          pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
          ...generalPartner.data?.principal_office_address,
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
          pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
          ...generalPartner.data?.principal_office_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
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
          pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
          ...generalPartner.data?.principal_office_address,
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
          pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
          ...generalPartner.data?.principal_office_address,
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

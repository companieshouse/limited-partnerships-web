import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Enter Registered Office Address Page", () => {
  const URL = getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
  });

  describe("GET Enter Registered Office Address Page", () => {
    it("should load the enter registered office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "jurisdictionCountry",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalPlaceOfBusinessAddress",
        "principalOfficeAddress",
        "errorMessages",
        "newRequirement"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the enter registered office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "jurisdictionCountry",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalPlaceOfBusinessAddress",
        "principalOfficeAddress",
        "errorMessages",
        "newRequirement"
      ]);
    });
  });

  describe("POST Enter Registered Office Address Page", () => {
    it("should redirect to the confirm address page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address
        });

      const redirectUrl = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: "Invalid page type",
          ...limitedPartnership.data?.registered_office_address,
          country: "Scotland"
        });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should return a validation error when jurisdiction of Scotland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should return a Welsh validation error when jurisdiction of Scotland does not match country", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL + "?lang=cy")
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(cyTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(cyTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should return a validation error when jurisdiction of Northern Ireland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.NORTHERN_IRELAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should return a validation error when jurisdiction of England and Wales does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should return a validation error when postcode format is invalid", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return validation errors when address fields contain invalid characters", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          premises: "±",
          address_line_1: "±",
          address_line_2: "±",
          locality: "±",
          region: "±",
          postal_code: "±"
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
      expect(res.text).toContain(
        enTranslationText.address.enterAddress.postcode +
          " " +
          enTranslationText.address.enterAddress.errorMessages.invalidCharacters
      );

      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });

    it("should return validation errors when address fields exceed character limit", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
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

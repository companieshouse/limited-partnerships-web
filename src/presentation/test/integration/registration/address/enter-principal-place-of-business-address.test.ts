import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import AddressPageType from "../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

describe("Enter Principal Place Of Business Manual Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    appDevDependencies.limitedPartnershipGateway.feedErrors();
  });

  describe("GET Enter Principal Place Of Business Page", () => {
    it("should load the enter principal place of business page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "usualResidentialAddress",
        "correspondenceAddress",
        "jurisdictionCountry",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the enter principal place of business page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "usualResidentialAddress",
        "correspondenceAddress",
        "jurisdictionCountry",
        "principalOfficeAddress",
        "errorMessages"
      ]);
    });
  });

  describe("POST Enter Principal Place Of Business Address Page", () => {
    it("should redirect to the confirm principal place of business address page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address
        });

      const redirectUrl = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
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
          ...limitedPartnership.data?.principal_place_of_business_address,
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
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return a Welsh validation error when jurisdiction of Scotland does not match country", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL + "?lang=cy")
        .send({
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(cyTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
      expect(res.text).toContain(cyTranslationText.govUk.error.title);
    });

    it("should return a validation error when jurisdiction of Northern Ireland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.NORTHERN_IRELAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return a validation error when jurisdiction of England and Wales does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return a validation error when postcode format is invalid", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
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
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
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
          pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address,
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
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesLength);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Length);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Length);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityLength);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionLength);
    });

    describe("UK not mainland", () => {
      let limitedPartnership: TransactionLimitedPartnership;

      beforeEach(() => {
        limitedPartnership = new LimitedPartnershipBuilder().build();
      });

      it("should return an error if the postcode is from Jersey", async () => {
        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
            ...limitedPartnership.data?.principal_place_of_business_address,
            postal_code: "JE2 3AA"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);
      });

      it("should return an error if the postcode is from Guernsey", async () => {
        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
            ...limitedPartnership.data?.principal_place_of_business_address,
            postal_code: "GY1 2AL"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);
      });

      it("should return an error if the postcode is from Isle of Man", async () => {
        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
            ...limitedPartnership.data?.principal_place_of_business_address,
            postal_code: "IM2 4NN"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);
      });
    });
  });
});

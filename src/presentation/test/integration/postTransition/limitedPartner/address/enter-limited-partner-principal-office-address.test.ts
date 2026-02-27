import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../../presentation/controller/addressLookUp/url/postTransition";
import LimitedPartnerBuilder, {
  limitedPartnerLegalEntity,
  limitedPartnerPerson
} from "../../../../builder/LimitedPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";

describe("Enter limited partner's principal office manual address page", () => {
  const URL = getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get enter limited partner's principal office address page", () => {
    it("should load enter limited partners principal office address page with English text", async () => {
      setLocalesEnabled(true);
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

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
      expect(res.text).not.toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(countOccurrences(res.text, enTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should load enter limited partners principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

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
      expect(res.text).not.toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(countOccurrences(res.text, enTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should have back link to yes/no page when partner kind is UPDATE_LIMITED_PARTNER_LEGAL_ENTITY", async () => {
      const updateLimitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([updateLimitedPartner]);

      const backLinkUrl = getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(backLinkUrl);
    });
  });

  describe("Post enter limited partner's principal office address page", () => {
    it("should redirect to the error page when error occurs during Post", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

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

      const redirectUrl = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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

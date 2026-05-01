import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations,
  toEscapedHtml
} from "../../../../../presentation/test/utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
  WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL
} from "../../../../../presentation/controller/postTransition/url";

import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

describe("Enter Principal Place Of Business Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
  const URL_WITH_IDS = getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL);
  const REDIRECT_URL = getUrl(WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL);

  let companyProfile: { _id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    setLocalesEnabled(false);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.limitedPartnershipGateway.setError(false);

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
  });

  describe("GET Enter Principal Place Of Business Address Page", () => {
    it("should load the enter principal place of business address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "jurisdictionCountry",
        "usualResidentialAddress",
        "correspondenceAddress",
        "registeredOfficeAddress",
        "principalOfficeAddress",
        "errorMessages",
        "titleHint3",
        "newRequirement",
        "titleHint2"
      ]);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.serviceAddress?.premises);
      expect(res.text).toContain(companyProfile.data.serviceAddress?.addressLineOne);
      expect(res.text).toContain(companyProfile.data.serviceAddress?.postalCode);
      expect(res.text).toContain(companyProfile.data.serviceAddress?.locality);
      expect(res.text).toContain(companyProfile.data.serviceAddress?.country);
      expect(
        countOccurrences(
          res.text,
          toEscapedHtml(enTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress)
        )
      ).toBe(2);
    });

    it("should load the enter principal place of business address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "jurisdictionCountry",
        "usualResidentialAddress",
        "correspondenceAddress",
        "registeredOfficeAddress",
        "principalOfficeAddress",
        "errorMessages",
        "titleHint3",
        "newRequirement",
        "titleHint2"
      ]);
      expect(
        countOccurrences(
          res.text,
          toEscapedHtml(cyTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress)
        )
      ).toBe(2);
    });
  });

  describe("POST Enter Principal Place Of Business Address Page", () => {
    it("should redirect to the When did the PPOB change page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address
        });

      const redirectUrl = getUrl(WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(
        enTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress
      );
    });
  });

  it("should redirect to the When did the PPOB change page when using ids in url", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL_WITH_IDS)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address
      });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
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

  it.each([URL, URL_WITH_IDS])(
    "should return a validation error if api validation error occurs creating LimitedPartnership",
    async (url) => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipName(companyProfile.data.companyName ?? "")
        .build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const apiErrors: ApiErrors = {
        errors: { something: "Something is invalid" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(url)
        .send({
          pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
          ...limitedPartnership.data?.principal_place_of_business_address
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName?.toUpperCase());
      expect(res.text).toContain("Something is invalid");
    }
  );

  it("should not return a validation error when jurisdiction does not match country", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.NORTHERN_IRELAND).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
        country: "Wales"
      });

    expect(res.status).toBe(302);
    expect(res.text).not.toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
    expect(res.text).not.toContain(enTranslationText.govUk.error.title);
  });

  it("should return a validation error when postcode format is invalid", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
        postal_code: "here"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
    expect(res.text).toContain(enTranslationText.govUk.error.title);
    expect(res.text).toContain(companyProfile.data.companyName?.toUpperCase());
  });

  it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
        premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
        address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
        address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
        locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
        region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
      });

    const redirectUrl = getUrl(WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL);
    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
  });

  it("should return validation errors when address fields contain invalid characters", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
        premises: "±",
        address_line_1: "±",
        address_line_2: "±",
        locality: "±",
        region: "±",
        postal_code: "±",
        country: "±"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesInvalid);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Invalid);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Invalid);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityInvalid);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionInvalid);
    expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeInvalid);

    expect(res.text).toContain(enTranslationText.govUk.error.title);
    expect(res.text).toContain(companyProfile.data.companyName?.toUpperCase());
  });

  it("should return validation errors when address fields exceed character limit", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
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

  it("should not return a validation error when jurisdiction is overseas", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app)
      .post(URL)
      .send({
        pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress,
        ...limitedPartnership.data?.principal_place_of_business_address,
        postal_code: "",
        country: "Afghanistan"
      });

    expect(res.status).toBe(302);
    expect(res.text).not.toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
    expect(res.text).not.toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
  });
});

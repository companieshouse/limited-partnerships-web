import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Enter Principal Place Of Business Manual Address Page", () => {
  const URL = getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
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
        "jurisdictionCountry",
        "principalOfficeAddress"
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
        "jurisdictionCountry",
        "principalOfficeAddress"
      ]);
    });
  });

  describe("POST Enter Principal Place Of Business Address Page", () => {
    it("should redirect to the confirm principal place of business address page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
        country: "Wales"
      });

      const redirectUrl = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: "Scotland"
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should return a validation error when jurisdiction of Scotland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.SCOTLAND).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
        country: "Northern Ireland"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
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
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(cyTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(cyTranslationText.govUk.error.title);
    });

    it("should return a validation error when jurisdiction of Northern Ireland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.NORTHERN_IRELAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
        country: "Scotland"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return a validation error when jurisdiction of England and Wales does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
        country: "Scotland"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });
  });
});

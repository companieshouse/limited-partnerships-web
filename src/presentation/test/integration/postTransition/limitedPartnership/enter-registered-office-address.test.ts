import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL
} from "../../../../controller/postTransition/url";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

describe("Enter Registered Office Address Page", () => {
  const URL = getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_URL);
  const URL_WITH_IDS = getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.limitedPartnershipGateway.setError(false);
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
        "errorMessages"
      ]);

      testTranslations(res.text, enTranslationText.address.registeredOffice, ["newRequirement", "provideNext"]);
      expect(res.text).not.toContain("WELSH -");
      expect(countOccurrences(res.text, enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress)).toBe(2);
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
        "errorMessages"
      ]);
      testTranslations(res.text, cyTranslationText.address.registeredOffice, ["newRequirement", "provideNext"]);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress)).toBe(2);
    });
  });

  describe("POST Enter Registered Office Address Page", () => {
    it("should redirect to the When did the ROA change page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address
        });

      const redirectUrl = getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(enTranslationText.transactionDescription.updateLimitedPartnershipRegisteredOfficeAddress);
    });

    it("should redirect to the When did the ROA change page when using ids in url", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL_WITH_IDS)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address
        });

      const redirectUrl = getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL);
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

    it.each([URL, URL_WITH_IDS])(
      "should return a validation error if api validation error occurs creating LimitedPartnership",
      async (url) => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipName(companyProfile.data.companyName)
          .build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const apiErrors: ApiErrors = {
          errors: { something: "Something is invalid" }
        };

        appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

        const res = await request(app)
          .post(url)
          .send({
            pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.govUk.error.title);
        expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
        expect(res.text).toContain("Something is invalid");
      }
    );

    it("should return a validation error when jurisdiction of Scotland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withJurisdiction(Jurisdiction.SCOTLAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Northern Ireland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should return a validation error when jurisdiction of Northern Ireland does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.NORTHERN_IRELAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should return a validation error when jurisdiction of England and Wales does not match country", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          country: "Scotland"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.jurisdictionCountry);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should return a validation error when postcode format is invalid", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.address.enterAddress.errorMessages.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
          ...limitedPartnership.data?.registered_office_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL);
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
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
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
      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should return validation errors when address fields exceed character limit", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
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

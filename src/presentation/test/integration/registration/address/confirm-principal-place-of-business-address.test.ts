import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../../presentation/test/utils";
import { CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";
import { REVIEW_GENERAL_PARTNERS_URL, TERM_URL } from "../../../../../presentation/controller/registration/url";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../presentation/controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

describe("Confirm Principal Place Of Business Address Page", () => {
  const URL = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
  const body = {
    pageType: AddressPageType.confirmPrincipalPlaceOfBusinessAddress,
    address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
  };

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["principal_place_of_business_address"]: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET Confirm Principal Place Of Business Address Page", () => {
    it("should load the confirm principal place of business page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.principalPlaceOfBusinessAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });

    it("should load the confirm principal place of business page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.principalPlaceOfBusinessAddress);
    });
  });

  describe("POST Confirm Principal Place Of Business Address Page", () => {
    it("should redirect to the next page - type is not PFLP or SPFLP", async () => {
      const res = await request(app).post(URL).send(body);

      const redirectUrl = getUrl(TERM_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the next page if type is PFLP and there is no gp", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.PFLP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

      const res = await request(app).post(URL).send(body);

      const redirectUrl = getUrl(TERM_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to review general partners if type is PFLP and there is at least 1 gp", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.PFLP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send(body);

      const redirectUrl = getUrl(REVIEW_GENERAL_PARTNERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to review general partners if type is SPFLP and there is at least 1 gp", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.SPFLP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send(body);

      const redirectUrl = getUrl(REVIEW_GENERAL_PARTNERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmPrincipalPlaceOfBusinessAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it("should show validation error message if validation error occurs when saving address", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const apiErrors: ApiErrors = {
        errors: {
          "principalPlaceOfBusinessAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send(body);

      expect(res.status).toBe(200);
      expect(res.text).toContain("must not be null");
    });
  });
});

import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import enTranslationText from "../../../../../../locales/en/translations.json";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock from "../../mock/sdkMock";
import appRealDependencies from "../../../../../app";
import { REGISTRATION_BASE_URL } from "config";
import { GENERAL_PARTNER_CHOICE_TEMPLATE, REVIEW_GENERAL_PARTNERS_TEMPLATE } from "presentation/controller/registration/template";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("GET", () => {
    it("should render the add general partner legal entity page", async () => {
      const res = await request(appRealDependencies).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain("Add a general partner");
    });

    it("should contain a back link to the reviw page when general partners are present", async () => {

      const res = await request(appRealDependencies).get(getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(`${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_GENERAL_PARTNERS_TEMPLATE}`);
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const sdkWithoutGeneralPaners = { ...sdkMock };
      sdkWithoutGeneralPaners.limitedPartnershipsService.getGeneralPartners = jest.fn().mockImplementation(() => ({
        httpStatusCode: 200,
        resource: []
      }));
      mockCreateApiClient.mockReturnValueOnce(sdkWithoutGeneralPaners);
      const res = await request(appRealDependencies).get(getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(`${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${GENERAL_PARTNER_CHOICE_TEMPLATE}`);
      expect(res.text).toMatch(regex);
    });
  });

  describe("200", () => {
    it("should add a general partner legal entity", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity
      });

      expect(res.status).toBe(302);
    });

    it("should update a general partner person", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
        forename: "Joe",
        surname: "Doe",
        "date_of_birth-day": "01",
        "date_of_birth-month": "01",
        "date_of_birth-year": "2001",
        nationality1: "BRITISH",
        former_names: "previous name",
        previousNames: "false"
      });

      expect(res.status).toBe(302);
    });
  });

  describe("400", () => {
    it("should return validation errors - add general partner legal entity page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postGeneralPartner: () => ({
            httpStatusCode: 400,
            resource: {
              errors: {
                legalEntityName: "Invalid value for legal entity name"
              }
            }
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Invalid value for legal entity name");
    });
  });

  describe("500", () => {
    it("should load error page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postGeneralPartner: () => ({
            httpStatusCode: 500,
            resource: {}
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});

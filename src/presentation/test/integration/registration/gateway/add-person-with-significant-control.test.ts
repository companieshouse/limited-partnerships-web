import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import enTranslationText from "../../../../../../locales/en/translations.json";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";

import sdkMock from "../../mock/sdkMock";

import RegistrationPageType from "../../../../controller/registration/PageType";
import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL
} from "../../../../controller/registration/url";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Add Person With Significant Person Legal Entity Page", () => {
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("200", () => {
    it("should add a person with significant control relavent legal entity", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
      });

      expect(res.status).toBe(302);
    });

    it("should get a person with significant control relavent legal entity", async () => {
      const res = await request(appRealDependencies).get(URL);

      expect(res.status).toBe(200);
    });

    it("should patch a person with significant control relavent legal entity", async () => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
      });

      expect(res.status).toBe(302);
    });
  });

  describe("400", () => {
    it("should return validation errors - add person with significant control relavent legal entity page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postPsc: () => ({
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
        pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
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
          postPsc: () => ({
            httpStatusCode: 500,
            resource: {}
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});

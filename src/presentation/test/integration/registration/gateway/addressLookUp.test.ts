import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import sdkMock, { getListOfValidPostcodeAddresses, isValidUKPostcode } from "../../mock/sdkMock";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import enTranslationText from "../../../../../../locales/en/translations.json";
import { getUrl } from "../../../utils";
import CacheRepository from "../../../../../infrastructure/repository/CacheRepository";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

jest.mock("../../../../../infrastructure/repository/CacheRepository");
const mockSession = CacheRepository as jest.Mock;
mockSession.mockReturnValue({
  getData: jest.fn().mockImplementation(() => ({
    limited_partnership: {
      [`registration_registered_office_address`]: {
        postal_code: "ST6 3LJ",
        address_line_1: "",
        address_line_2: "",
        locality: "",
        country: "",
        premises: ""
      }
    }
  }))
});

describe("Gateway Address Look Up", () => {
  const URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("isValidUKPostcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: "",
        postal_code: "ST6 3LJ"
      });

      expect(isValidUKPostcode).toHaveBeenCalled();
      expect(getListOfValidPostcodeAddresses).toHaveBeenCalled();

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: "2",
        postal_code: "ST6 3LJ"
      });

      expect(isValidUKPostcode).toHaveBeenCalled();
      expect(getListOfValidPostcodeAddresses).toHaveBeenCalled();

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should load error page when error thrown from isValidUKPostcode", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        postCodeLookup: {
          ...sdkMock.postCodeLookup,
          isValidUKPostcode: () => {
            throw new Error();
          }
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        address_line_1: "2",
        postal_code: "ST6 3LJ"
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should return an error when address list returned is empty", async () => {
      getListOfValidPostcodeAddresses.mockResolvedValueOnce([]);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: "CF14 3UZ"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode CF14 3UZ cannot be found`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});

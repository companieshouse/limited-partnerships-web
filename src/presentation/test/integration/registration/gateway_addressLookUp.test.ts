import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import sdkMock, {
  getListOfValidPostcodeAddresses,
  isValidUKPostcode
} from "../mock/sdkMock";

import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url";
import AddressPageType from "../../../controller/addressLookUp/PageType";
import enTranslationText from "../../../../../locales/en/translations.json";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Gateway Address Look Up", () => {
  const url = appDevDependencies.addressLookUpController.insertIdsInUrl(
    POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    appDevDependencies.transactionGateway.transactionId,
    appDevDependencies.limitedPartnershipGateway.submissionId
  );

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("isValidUKPostcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(appRealDependencies).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premise: "",
        postal_code: "ST6 3LJ"
      });

      expect(isValidUKPostcode).toHaveBeenCalled();
      expect(getListOfValidPostcodeAddresses).toHaveBeenCalled();

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/choose-registered-office-address`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const res = await request(appRealDependencies).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premise: "2",
        postal_code: "ST6 3LJ"
      });

      expect(isValidUKPostcode).toHaveBeenCalled();
      expect(getListOfValidPostcodeAddresses).toHaveBeenCalled();

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/choose-registered-office-address`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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

      const res = await request(appRealDependencies).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        address_line_1: "2",
        postal_code: "ST6 3LJ"
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});

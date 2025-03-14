import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import sdkMock from "../../mock/sdkMock";
import { POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url";
import { getUrl, setLocalesEnabled } from "../../../utils";
import appRealDependencies from "../../../../../app";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Postcode Usual Residential Address Page", () => {
  const URL = getUrl(POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
  });

  describe("Get Postcode Usual Residential Address Page", () => {
    it("should load the usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(appRealDependencies).get(URL);

      expect(res.status).toBe(200);
    });
  });
});

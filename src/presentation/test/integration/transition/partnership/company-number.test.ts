import request from "supertest";

import app from "../../app";
import { getUrl } from "../../../utils";
import { COMPANY_LOOKUP_URL, COMPANY_NUMBER_URL } from "../../../../../presentation/controller/transition/url";

describe("Company number page", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

  describe("GET company number", () => {
    it("should redirect to the company lookup service", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(302);
      expect(res.header.location).toEqual(COMPANY_LOOKUP_URL);
    });
  });
});

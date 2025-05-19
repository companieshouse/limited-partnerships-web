import request from "supertest";

import app from "../app";
import { NEXT_URL, PAYMENT_URL } from "../../../controller/global/url";
import { getUrl } from "../../utils";

describe("Payment", () => {
  it("should redirect to next page", async () => {
    const res = await request(app).get(PAYMENT_URL);

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(NEXT_URL));
  });
});

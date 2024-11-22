import request from "supertest";

import app from "./app";
import { HEALTHCHECK_URL } from "../../controller/global/Routing";

describe("Error pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'page-not-found' page", async () => {
    const response = await request(app).get(HEALTHCHECK_URL + "wrong-url");

    expect(response.status).toEqual(404);
    expect(response.text).toContain("Page not found");
  });
});

import app from "app";
import request from "supertest";
import * as config from "../config";
import { hasFeature } from "../utils/feature.flag";

jest.mock("../utils/feature.flag");

(hasFeature as jest.Mock).mockReturnValue({
  "FLAG_1": false,
  "FLAG_2": true
});

describe("Experimental flags test", () => {
  test("something", async () => {
    await request(app).get(config.START_URL);

    // check console to see what is logged
  });
});

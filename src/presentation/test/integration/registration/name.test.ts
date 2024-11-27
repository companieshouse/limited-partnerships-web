import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";

import app from "../app";
import {
  NAME_URL,
} from "../../../controller/registration/Routing";

describe("Name Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the name page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain("WELSH - What is the limited partnership name?");
    expect(res.text).toContain("WELSH - Save and continue");
  });

  it("should load the name page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain("What is the limited partnership name?");
    expect(res.text).toContain("Save and continue");
    expect(res.text).not.toContain("WELSH -");
  });

});

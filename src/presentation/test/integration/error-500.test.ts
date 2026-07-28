jest.mock("../../controller/registration/LimitedPartnershipController", () => {
  const actual = jest.requireActual("../../controller/registration/LimitedPartnershipController");
  jest.spyOn(actual.default.prototype, "getPageRouting").mockImplementation(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      return Promise.resolve().then(() => next(new Error("Mocked Error 500")));
    };
  });
  return actual;
});

import request from "supertest";
import app from "./app";
import { PARTNERSHIP_TYPE_URL } from "presentation/controller/registration/url";
import { enTranslationText } from "../../../test/utils/locales";
import { Request, Response, NextFunction } from "express";

describe("Error 500", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'error-page' page", async () => {
    const response = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(enTranslationText.errorPage.sorryMessage);
    expect(response.text).toContain(enTranslationText.links.back);
    expect(response.text).toContain(enTranslationText.links.signOut);
  });
});

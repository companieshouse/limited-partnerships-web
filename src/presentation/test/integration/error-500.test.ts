import request from "supertest";
import { NextFunction, Request, Response } from "express";

import app from "./app";
import { HEALTHCHECK_URL } from "../../controller/global/Routing";

jest.mock("../../controller/global/Controller", () => {
  return jest.fn().mockImplementation(() => {
    return {
      ...jest.requireActual("../../controller/global/Controller"),
      getPageRouting: jest.fn().mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
          return next();
        };
      }),
      getHealthcheck: jest.fn().mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
          next(new Error("Error 500"));
        };
      }),
    };
  });
});

describe("Error 500", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'error-page' page", async () => {
    const response = await request(app).get(HEALTHCHECK_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });
});

import request from "supertest";
import { CsrfError } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";

import app from "./app";
import { HEALTHCHECK_URL } from "../../controller/global/url";

jest.mock("../../controller/global/Controller", () => {
  return function () {
    return {
      getPageRouting: function () {
        return (_req: Request, _res: Response, next: NextFunction) => {
          return next();
        };
      },
      getSignOut: jest.fn().mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
          return next();
        };
      }),
      signOutChoice: jest.fn().mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
          return next();
        };
      }),
      getHealthcheck: function () {
        return (_req: Request, _res: Response, next: NextFunction) => {
          next(new CsrfError("CSRF token mismatch"));
        };
      },
      getConfirmationPage: jest.fn().mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
          return next();
        };
      })
    };
  };
});

describe("Error csrf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should render the CSRF error page", async () => {
    const response = await request(app).get(HEALTHCHECK_URL);

    expect(response.status).toEqual(403);
    expect(response.text).toContain("Sorry, something went wrong");
    expect(response.text).toContain(
      "We have not been able to save the information you submitted on the previous screen."
    );
  });
});

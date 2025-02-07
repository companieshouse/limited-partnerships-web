import { NextFunction, Request, Response } from "express";

jest.mock("ioredis");
// jest.mock("../utils/logger");

jest.mock("../middlewares/authentication.middleware", () => ({
  authentication: (req: Request, res: Response, next: NextFunction) => next()
}));

/*
  Mock Implementation of Web Node Security CsrfProtectionMiddleware.
  Note: this needs to be imported before the 'app' component in each test module in order for 'app' to be able to mock it.
*/
jest.mock("@companieshouse/web-security-node", () => ({
  ...jest.requireActual("@companieshouse/web-security-node"),
  CsrfProtectionMiddleware:
    (_opts) => (req: Request, res: Response, next: NextFunction) =>
      next()
}));

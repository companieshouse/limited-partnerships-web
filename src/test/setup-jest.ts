import { NextFunction, Request, Response } from "express";

jest.mock("ioredis");
jest.mock("../utils/logger");

jest.mock("../middlewares/authentication.middleware", () => ({
  authentication: (req: Request, res: Response, next: NextFunction) => {
    res.locals.userEmail = "test@example.com";
    next();
  }
}));

jest.mock("../middlewares/company-authentication.middleware", () => ({
  companyAuthentication: (req: Request, res: Response, next: NextFunction) => next()
}));

/*
  Mock Implementation of Web Node Security CsrfProtectionMiddleware.
  Note: this needs to be imported before the 'app' component in each test module in order for 'app' to be able to mock it.
*/
jest.mock("@companieshouse/web-security-node", () => ({
  ...jest.requireActual("@companieshouse/web-security-node"),
  CsrfProtectionMiddleware: (_opts) => (req: Request, res: Response, next: NextFunction) => next(),
  authMiddleware: () => jest.fn(() => (req: Request, res: Response, next: NextFunction) => next())
}));

jest.mock("../utils/session", () => ({
  ...jest.requireActual("../utils/session"),
  getLoggedInUserEmail: jest.fn(() => "test@email.com")
}));

jest.mock("@companieshouse/node-session-handler", () => ({
  ...jest.requireActual("@companieshouse/node-session-handler"),
  SessionMiddleware: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next())
}));

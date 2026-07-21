import { NextFunction, Request, Response } from "express";
import * as net from "net";

// In Node 19+, http.Server.close() stops accepting new connections but keeps
// existing keep-alive connections open until their idle timeout fires (~5 s).
// When the OS recycles a recently-closed ephemeral port for the next supertest
// server, a stale keep-alive socket sends data to the wrong server, causing
// "Parse Error: Expected HTTP/" or ECONNRESET.
//
// Patch net.Server.prototype.close (the base class close shared by all HTTP
// servers) so that closeAllConnections() is always called first, forcing
// immediate port release.
const origServerClose = net.Server.prototype.close;
net.Server.prototype.close = function (this: net.Server, cb?: (err?: Error) => void) {
  if (typeof (this as any).closeAllConnections === "function") {
    (this as any).closeAllConnections();
  }
  return origServerClose.call(this, cb);
};

// Automatically retry each failing test up to 2 times to handle rare
// intermittent network-timing failures (Parse Error / ECONNRESET) in Node 24.
jest.retryTimes(2, { logErrorsBeforeRetry: true });

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

jest.mock("../middlewares/acsp-authentication.middleware", () => ({
  acspAuthentication: (req: Request, res: Response, next: NextFunction) => next()
}));

/*
  Mock Implementation of Web Node Security CsrfProtectionMiddleware.
  Note: this needs to be imported before the 'app' component in each test module in order for 'app' to be able to mock it.
*/
jest.mock("@companieshouse/web-security-node", () => ({
  ...jest.requireActual("@companieshouse/web-security-node"),
  CsrfProtectionMiddleware: (_opts: unknown) => (req: Request, res: Response, next: NextFunction) => next(),
  authMiddleware: () => jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  acspManageUsersAuthMiddleware: jest.fn(() => jest.fn((req: Request, res: Response, next: NextFunction) => next()))
}));

jest.mock("../utils/session", () => ({
  ...jest.requireActual("../utils/session"),
  getLoggedInUserEmail: jest.fn(() => "test@email.com")
}));

jest.mock("@companieshouse/node-session-handler", () => ({
  ...jest.requireActual("@companieshouse/node-session-handler"),
  SessionMiddleware: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next())
}));

import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { acspManageUsersAuthMiddleware } from "@companieshouse/web-security-node";
import { CHS_URL } from "../../../config/constants";
import { acspAuthentication } from "../../../middlewares/acsp-authentication.middleware";

jest.unmock("../../../middlewares/acsp-authentication.middleware");

const mockedAcspManageUsersAuthMiddleware = jest.mocked(acspManageUsersAuthMiddleware);

describe("ACSP authentication middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: { data: { [SessionKey.SignInInfo]: { [SignInInfoKeys.AcspNumber]: "AB123456" } } },
      originalUrl: "/limited-partnerships/registration/transaction/123/submission/456/jurisdiction"
    } as Request & { session: Session };

    res = {} as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should delegate to acspManageUsersAuthMiddleware", () => {
    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalled();
    const delegatedMiddleware = jest.mocked(mockedAcspManageUsersAuthMiddleware.mock.results[0].value);
    expect(delegatedMiddleware).toHaveBeenCalledWith(req, res, next);
  });

  it("should pass correct config to acspManageUsersAuthMiddleware", () => {
    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        chsWebUrl: CHS_URL,
        returnUrl: "/limited-partnerships/registration/transaction/123/submission/456/jurisdiction",
        acspNumber: expect.any(String)
      })
    );
  });

  it("should preserve URL with query parameters", () => {
    req.originalUrl = "/limited-partnerships/registration/?step=1&id=123";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    const config = mockedAcspManageUsersAuthMiddleware.mock.calls[0][0];
    expect(config.returnUrl).toBe("/limited-partnerships/registration/?step=1&id=123");
  });

  it("should preserve URL with hash fragment", () => {
    req.originalUrl = "/limited-partnerships/registration/something#section";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    const config = mockedAcspManageUsersAuthMiddleware.mock.calls[0][0];
    expect(config.returnUrl).toBe("/limited-partnerships/registration/something#section");
  });

  it("should handle root path", () => {
    req.originalUrl = "/";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    const config = mockedAcspManageUsersAuthMiddleware.mock.calls[0][0];
    expect(config.returnUrl).toBe("/");
  });

});


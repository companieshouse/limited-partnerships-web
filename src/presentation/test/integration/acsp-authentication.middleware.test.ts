import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { acspManageUsersAuthMiddleware } from "@companieshouse/web-security-node";
import { CHS_URL } from "../../../config/constants";
import { NOT_ELIGIBLE_URL, SIGN_OUT_URL } from "../../controller/global/url";
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

  it("should delegate to acspManageUsersAuthMiddleware for transition routes", () => {
    req.originalUrl = "/limited-partnerships/transition/company/LP123456/transaction/123/submission/456/general-partners";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        chsWebUrl: CHS_URL,
        returnUrl: req.originalUrl,
        acspNumber: expect.any(String)
      })
    );
  });

  it("should delegate to acspManageUsersAuthMiddleware for post-transition (update) routes", () => {
    req.originalUrl = "/limited-partnerships/update/company/LP123456/transaction/123/submission/456/general-partner-choice";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        chsWebUrl: CHS_URL,
        returnUrl: req.originalUrl,
        acspNumber: expect.any(String)
      })
    );
  });

  it("should delegate to acspManageUsersAuthMiddleware for any other limited-partnerships route", () => {
    req.originalUrl = "/limited-partnerships/some-other-page";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalled();
  });

  it("should not apply the ACSP check to the not-eligible stop page", () => {
    req.originalUrl = NOT_ELIGIBLE_URL;

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should not apply the ACSP check to the not-eligible stop page regardless of path casing", () => {
    req.originalUrl = "/limited-partnerships/Not-Eligible";

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should not apply the ACSP check to the not-eligible stop page when it carries a query string", () => {
    req.originalUrl = `${NOT_ELIGIBLE_URL}?lang=cy`;

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should still gate a route that merely contains 'not-eligible' as a path segment prefix", () => {
    req.originalUrl = `${NOT_ELIGIBLE_URL}-appeal`;

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        chsWebUrl: CHS_URL,
        returnUrl: req.originalUrl,
        acspNumber: expect.any(String)
      })
    );
  });

  it("should not apply the ACSP check to the sign-out page", () => {
    req.originalUrl = SIGN_OUT_URL;

    acspAuthentication(req as Request, res as Response, next as NextFunction);

    expect(mockedAcspManageUsersAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

});

